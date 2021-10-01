const StorageComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "StorageComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const obj = Game.getObjectById(data.id);
        self.objType = "Storage";
    },
}

module.exports = StorageComponent;