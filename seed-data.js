// Seed 20 random users for testing
(function () {
    const STORAGE_KEY = 'seismic_users';
    // Don't re-seed if data already exists
    if (localStorage.getItem(STORAGE_KEY)) return;

    const firstNames = [
        'Akira', 'Zara', 'Marcus', 'Elena', 'Dante', 'Mira', 'Kai', 'Sasha',
        'Raven', 'Felix', 'Luna', 'Orion', 'Nova', 'Atlas', 'Ivy', 'Phoenix',
        'Jasper', 'Cleo', 'Silas', 'Aria'
    ];

    const lastNames = [
        'Nakamura', 'Volkov', 'Okafor', 'Mendez', 'Blackwood', 'Al-Rashid', 'Chen',
        'Petrova', 'Kimura', 'Osei', 'Castillo', 'Johansson', 'Adeyemi', 'Park',
        'Reyes', 'Ivanova', 'Tanaka', 'Diallo', 'Rivera', 'Singh'
    ];

    function makePhoto(seed) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        const hue = 20 + (seed * 7) % 40;
        const sat = 40 + (seed * 3) % 30;
        const light = 35 + (seed * 5) % 25;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#e8dcc8';
        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        return canvas.toDataURL('image/png');
    }

    function makeSignature(seed) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const startX = 20 + (seed % 20);
        ctx.moveTo(startX, 50);
        const points = 5 + (seed % 6);
        for (let i = 1; i <= points; i++) {
            const x = startX + (i * (240 / points));
            const y = 50 + Math.sin(seed + i * 1.5) * 30;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        return canvas.toDataURL('image/png');
    }

    const users = [];
    for (let i = 0; i < 20; i++) {
        users.push({
            id: Date.now() - (20 - i) * 100000,
            name: `${firstNames[i]} ${lastNames[i]}`,
            magnitude: Math.floor(Math.random() * 9) + 1,
            photo: makePhoto(i),
            signature: makeSignature(i),
            registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    console.log(`✅ Seeded ${users.length} test users.`);
})();
