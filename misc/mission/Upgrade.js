const Upgrade = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "Upgrade",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        if (!data.controllerId) {
            throw Exception.New("ArgumentException", "Upgrade need controller id.").value;
        }
        self.controllerId = data.controllerId;
        self.linkId = data.linkId;
        self.targetPos = [];
    },

    OnEnable_Attribute: Config.Public,
    OnEnable: function(self){
        self.targetPos.length = 0;
        const linkObj = Game.getObjectById(self.linkId);
        const controllerObj = Game.getObjectById(self.controllerId);
        if (!linkObj | !controllerObj) {
            return;
        }
        const linkPos = linkObj.pos;
        const controllerPos = controllerObj.pos;
        const check = function(x, y){
            if (Vector2.DistanceToXY(controllerPos, x, y) === 1) {
                self.targetPos.push(Vector2.New(x, y, controllerPos.roomName));
            }
        }
        check(linkPos.x - 1, check.y + 1);
        check(linkPos.x, check.y + 1);
        check(linkPos.x + 1, check.y + 1);
        check(linkPos.x - 1, check.y);
        check(linkPos.x + 1, check.y);
        check(linkPos.x - 1, check.y - 1);
        check(linkPos.x, check.y - 1);
        check(linkPos.x + 1, check.y - 1);
    },

    Update_Attribute: Config.Public,
    Update: function(self){
        const linkObj = Game.getObjectById(self.linkId);
        const controllerObj = Game.getObjectById(self.controllerId);
        if (!linkObj | !controllerObj) {
            Option.SetActive(self, false);
            console.log("Update can't find target.");
            return;
        }

        // if free capacity goto link withdraw

        // if store energy goto controller upgrade

    },
}

module.exports = Upgrade;