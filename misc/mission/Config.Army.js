const Army = {
    // 6 6
    None: 0,
    GatherTogether: 1,
    Migrate: 2,
    Attack: 3,

    migratePoints: [
        new RoomPosition(36, 43, 'W17N15'),
    ],
    virtual: true,
}

module.exports = Army;