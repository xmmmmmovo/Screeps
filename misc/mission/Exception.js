if (!Memory.Exception) {
    Memory.Exception = new Array();
}

const Exception = {
    _Attribute: Config.Public,
    typeName: "Exception",
    typeIndex: undefined,
    base: undefined,
    staticCtor: function(data) {},

    __init: function(self, type, message) {
        let error;
        self.message = message ? message : 'undefined?';
        self.time = Game.time;
        if (typeof(type) === "string") {
            self.type = type ? type : 'undefined?';
            error = new Error("time: " + self.time + " type: " + self.type + " message: " + self.message);
        } else {
            self.type = "Exception";
        }
        self.stack = error.stack;
        Memory.Exception.push(JSON.stringify(self));
        self.value = error;
        if (Memory.Exception.length > 20) {
            Memory.Exception.shift();
        }
    },
};

module.exports = Exception;