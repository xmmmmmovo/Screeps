if (Memory.Statistics === undefined) {
    Memory.Statistics = {}
}

var Statistics = undefined;
Statistics = {
    _Attribute: Config.Public,
    base: undefined,
    typeName: "Statistics",
    typeIndex: undefined,
    staticCtor: function(data) {
        // 从内存还原数据
    },

    Instance: undefined, // 单例
    AverageAPICost: 1, // 平均 tick 购买API的CPU开销
    APICost: 0, // 每个 tick 购买API的CPU开销
    TotalCost: 0, // push 以来的累计开销
    CostPretick: 0, // 每个 tick 的平均CPU开销
    TicksCount: 0, // push 以来度过的 tick 数量
    Bucket: 0, // 桶的存储量

    Update_Attribute: Config.Public | Config.Static,
    Update: function() {
        Statistics.AverageAPICost = Statistics.AverageAPICost * 0.6 + Statistics.APICost * 0.4;
        Statistics.APICost = 0; // 每个 tick 清 0
    },
    EndOfFrame_Attribute: Config.Public | Config.Static,
    EndOfFrame: function() {
        Statistics.TotalCost += Game.cpu.getUsed();
        Statistics.TicksCount++;
        Statistics.CostPretick = Statistics.TotalCost / Statistics.TicksCount;
        if (Statistics.TicksCount % 20 == 2) {
            Statistics.Bucket = Game.cpu.bucket;
            var CPU = {
                AverageAPICost: Math.floor(Statistics.AverageAPICost * 100) / 100,
                TotalCost: Math.floor(Statistics.TotalCost * 100) / 100,
                CostPretick: Math.floor(Statistics.CostPretick * 100) / 100,
                TicksCount: Statistics.TicksCount,
                Bucket: Statistics.Bucket,
            }
            Memory.Statistics.CPU = JSON.stringify(CPU);
        }
        if (Statistics.Bucket >= 10000 &&
            // 非官方没有 pixel
            Game.cpu.generatePixel) {
            Game.cpu.generatePixel();
        }
    },
};

module.exports = Statistics;