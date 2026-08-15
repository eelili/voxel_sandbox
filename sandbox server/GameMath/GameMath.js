// GameMath.js - 数学库统一加载清单

// 基础数学类
require('./GameVector2.js');
require('./GameBounds2.js');
require('./GameVector3.js');
require('./GameBounds3.js');
require('./GameQuaternion.js');
require('./GameComplex.js');
require('./GameBezierCurve.js');
require('./GameEuler.js');
require('./GameRGBColor.js');
require('./GameRGBAColor.js');
require('./GameOBBBounds3.js');

// 导出（可选）
module.exports = {
    GameVector2,
    GameBounds2,
    GameVector3,
    GameBounds3,
    GameQuaternion,
    GameComplex,
    GameBezierCurve,
    GameEuler,
    GameRGBColor,
    GameRGBAColor,
    GameOBBBounds3
};