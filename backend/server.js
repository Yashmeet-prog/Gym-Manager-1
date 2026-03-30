const { readData, writeData } = require('./database');
const bcrypt = require('bcrypt');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const data = readData();

if (data.users.length === 0) {
    const hashed = bcrypt.hashSync('admin123', 10);
    data.users.push({ username: 'admin', password: hashed });
    writeData(data);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});
app.get('/api/test', (req, res) => {
    res.json({ message: 'API working ✅' });
});
const JWT_SECRET = 'super-secret-gym-key-123';

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const data = readData();

    const user = data.users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { readData } = require('./database');

        const data = readData();

        const user = data.users.find(u => u.username === username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const totalResult = await db.get('SELECT COUNT(*) as count FROM members');

        const activeResult = await db.get(`
            SELECT COUNT(*) as count FROM members 
            WHERE date(expiry_date) > date('now')
        `);

        const membersRaw = await db.all('SELECT * FROM members');

        let activeCount = 0;
        let paidCount = 0;
        let partialCount = 0;
        let pendingCount = 0;
        let overdueCount = 0;

        let monthlyRevenue = 0;

        membersRaw.forEach(m => {
            const isExpired = new Date(m.expiry_date) < new Date();
            let status = 'Pending';

            const paid = m.amount_paid || 0;
            const total = m.fee || 0;

            if (isExpired) {
                status = 'Overdue';
                overdueCount++;
            } else {
                activeCount++;
                if (paid >= total && total > 0) {
                    status = 'Paid';
                    paidCount++;
                } else if (paid > 0 && paid < total) {
                    status = 'Partial';
                    partialCount++;
                } else {
                    pendingCount++;
                }

                // Safely calculate MRR only for ACTIVE members
                let total_months = (m.plan_months || 0) + ((m.plan_days || 0) > 0 ? 1 : 0);
                if (total_months === 0) total_months = 1;
                monthlyRevenue += total / total_months;
            }
        });

        // Round to 2 decimals avoiding long floats
        monthlyRevenue = Math.round(monthlyRevenue * 100) / 100;

        // Members whose expiry is within next 3 days or already expired
        const expiringResult = await db.get(`
            SELECT COUNT(*) as count FROM members 
            WHERE date(expiry_date) <= date('now', '+3 days')
        `);

        const expiringMembers = await db.all(`
            SELECT * FROM members 
            WHERE date(expiry_date) <= date('now', '+3 days')
            ORDER BY expiry_date ASC
            LIMIT 5
        `);

        // Generate growth chart data (last 6 months real cumulative joins)
        const allMembers = await db.all('SELECT join_date FROM members');
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            // Count cumulative joins up to that month
            const yearMonth = d.toISOString().slice(0, 7); // YYYY-MM
            let count = 0;
            allMembers.forEach(m => {
                if (m.join_date.slice(0, 7) <= yearMonth) {
                    count++;
                }
            });
            months.push({ name: monthStr, members: count });
        }

        res.json({
            totalMembers: membersRaw.length,
            activeMembers: activeCount,
            monthlyRevenue: monthlyRevenue,
            expiringCount: expiringResult.count,
            expiringMembers,
            growthData: months,
            counts: {
                paid: paidCount,
                partial: partialCount,
                pending: pendingCount,
                overdue: overdueCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const members = await db.all('SELECT * FROM members ORDER BY id DESC');

        // Enrich data with formatted calculations
        const enrichedMembers = members.map(m => {
            let total_months = (m.plan_months || 0) + ((m.plan_days || 0) > 0 ? 1 : 0);
            if (total_months === 0) total_months = 1;
            let mr = (m.fee || 0) / total_months;

            const isExpired = new Date(m.expiry_date) < new Date();
            const paid = m.amount_paid || 0;
            const total = m.fee || 0;

            let computed_status = 'Pending';
            if (isExpired) computed_status = 'Overdue';
            else if (paid >= total && total > 0) computed_status = 'Paid';
            else if (paid > 0 && paid < total) computed_status = 'Partial';

            return {
                ...m,
                total_months,
                monthly_revenue: Math.round(mr * 100) / 100,
                computed_status
            };
        });

        res.json(enrichedMembers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/members/:id', authenticateToken, async (req, res) => {
    try {
        const member = await db.get('SELECT * FROM members WHERE id = ?', [req.params.id]);
        if (member) {
            res.json(member);
        } else {
            res.status(404).json({ error: 'Member not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const calculateExpiryDate = (joinDateStr, months, days) => {
    // Standard JS Date effectively manages overflow organically (including varying month durations & leaps)
    const d = new Date(joinDateStr);
    d.setMonth(d.getMonth() + parseInt(months || 0, 10));
    d.setDate(d.getDate() + parseInt(days || 0, 10));
    return d.toISOString().split('T')[0];
};

app.post('/api/members', authenticateToken, async (req, res) => {
    const { name, phone, join_date, fee, plan_months, plan_days, amount_paid } = req.body;
    try {
        const strictExpiryDate = calculateExpiryDate(join_date, plan_months, plan_days);
        const result = await db.run(
            'INSERT INTO members (name, phone, join_date, expiry_date, payment_status, fee, plan_months, plan_days, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, phone, join_date, strictExpiryDate, 'Auto', fee || 0, plan_months || 1, plan_days || 0, amount_paid || 0]
        );
        const newMember = await db.get('SELECT * FROM members WHERE id = ?', [result.lastID]);
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, phone, join_date, fee, plan_months, plan_days, amount_paid } = req.body;
    try {
        const strictExpiryDate = calculateExpiryDate(join_date, plan_months, plan_days);
        await db.run(
            'UPDATE members SET name = ?, phone = ?, join_date = ?, expiry_date = ?, fee = ?, plan_months = ?, plan_days = ?, amount_paid = ? WHERE id = ?',
            [name, phone, join_date, strictExpiryDate, fee || 0, plan_months || 1, plan_days || 0, amount_paid || 0, id]
        );
        const updatedMember = await db.get('SELECT * FROM members WHERE id = ?', [id]);
        res.json(updatedMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM members WHERE id = ?', [id]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reminders/whatsapp', authenticateToken, (req, res) => {
    const { memberId } = req.body;

    const data = readData();

    const member = data.members?.find(m => m.id === memberId);

    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    setTimeout(() => {
        res.json({
            message: `WhatsApp reminder successfully scheduled for ${member.name} (${member.phone})`
        });
    }, 1500);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

