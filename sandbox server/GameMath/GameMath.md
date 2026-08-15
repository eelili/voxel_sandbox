# 游戏数学 API 文档

本数学库为沙盒世界提供了一套完整、独立的二维/三维向量、几何、旋转与颜色工具。所有类均以 `Game` 为前缀，挂载在全局对象上，创作者可直接使用，无需额外导入。

---

## 目录

1.  GameVector2 —— 二维向量
2.  GameVector3 —— 三维向量
3.  GameBounds2 —— 二维轴对齐包围盒
4.  GameBounds3 —— 三维轴对齐包围盒
5.  GameQuaternion —— 四元数（旋转）
6.  GameEuler —— 欧拉角
7.  GameOBBBounds3 —— 有向包围盒（OBB）
8.  GameRGBColor —— RGB 颜色
9.  GameRGBAColor —— RGBA 颜色
10. GameComplex —— 复数
11. GameBezierCurve —— 贝塞尔曲线

---

## 1. GameVector2 —— 二维向量

### 构造函数
    new GameVector2(x, y)

### 静态方法
    GameVector2.fromAngle(angle, length)      // 从角度和长度创建向量
    GameVector2.random()                      // 返回随机单位向量

### 实例方法

#### 运算
    set(x, y)                                 // 设置分量
    copy(v)                                   // 复制另一个向量
    clone()                                   // 返回新副本
    add(v) / addEq(v)                         // 向量加法（返回新向量/修改自身）
    sub(v) / subEq(v)                         // 向量减法
    mul(v) / mulEq(v)                         // 逐元素乘法
    div(v) / divEq(v)                         // 逐元素除法
    scale(s) / scaleEq(s)                     // 标量乘法

#### 几何属性
    dot(v)                                    // 点积（标量）
    cross(v)                                  // 叉积（标量）
    mag() / sqrMag()                          // 长度 / 平方长度
    normalize() / normalizeEq()               // 归一化
    angle()                                   // 返回与 X 轴正方向的夹角（弧度）
    rotate(rad) / rotateEq(rad)               // 绕原点旋转
    distance(v)                               // 到另一个向量的距离
    lerp(v, t)                                // 线性插值
    equals(v, eps)                            // 容差内相等

#### 类型转换
    toVector3(z)                              // 转为 GameVector3，Z 默认 0
    toArray()                                 // 转为 [x, y]

---

## 2. GameVector3 —— 三维向量

### 构造函数
    new GameVector3(x, y, z)

### 静态方法
    GameVector3.fromPolar(mag, phi, theta)    // 球面坐标创建
    GameVector3.fromEuler(euler)              // 将欧拉角转换为方向向量
    GameVector3.fromVector2(v, z)             // 从二维向量补 Z 轴

### 实例方法

#### 运算
    set(x, y, z)                              // 设置分量
    copy(v)                                   // 复制
    clone()                                   // 返回副本
    add(v) / addEq(v)                         // 加法
    sub(v) / subEq(v)                         // 减法
    mul(v) / mulEq(v)                         // 逐元素乘法
    div(v) / divEq(v)                         // 逐元素除法
    scale(s) / scaleEq(s)                     // 标量乘法

#### 几何属性
    dot(v)                                    // 点积（标量）
    cross(v)                                  // 叉积（返回 GameVector3）
    mag() / sqrMag()                          // 长度 / 平方长度
    normalize() / normalizeEq()               // 归一化
    angle(v)                                  // 两向量夹角（弧度）
    distance(v)                               // 到另一个向量的距离
    lerp(v, t)                                // 线性插值
    towards(v)                                // 返回指向目标的方向向量（归一化）
    max(v) / min(v)                           // 逐分量最大值 / 最小值
    equals(v, eps)                            // 容差内相等
    exactEquals(v)                            // 完全相等

#### 旋转与投影（新特性）
    rotate(quat) / rotateEq(quat)             // 用 GameQuaternion 旋转向量
    toEuler()                                 // 将自身作为方向向量转换为欧拉角
    projectXZ()                               // 投影到 XZ 平面，返回 GameVector2
    projectOnPlane(normal) / projectOnPlaneEq(normal)   // 投影到任意法线平面
    reflect(normal) / reflectEq(normal)       // 关于任意法线反射

#### 类型转换
    toVector2()                               // 丢弃 Z，返回 GameVector2
    toArray()                                 // 返回 [x, y, z]

---

## 3. GameBounds2 —— 二维轴对齐包围盒

### 构造函数
    new GameBounds2(lo, hi)                   // lo 与 hi 均为 GameVector2

### 静态方法
    GameBounds2.fromPoints(...points)         // 由多个 GameVector2 点计算包围盒

### 实例方法
    set(lo, hi)                               // 重新设置
    copy(b) / clone()                         // 复制/克隆
    contains(v)                               // 是否包含 GameVector2 点
    intersects(b)                             // 与另一个 GameBounds2 是否相交
    intersect(b)                              // 返回相交部分的包围盒（无重叠返回 null）
    union(b)                                  // 返回并集包围盒
    expand(v) / expandEq(v)                   // 扩展（沿各轴增加 GameVector2 量）
    toBounds3(zLo, zHi)                       // 转为三维包围盒（指定 Z 范围）

### 只读属性
    center                                    // 中心点 GameVector2
    size                                      // 尺寸 GameVector2
    halfSize                                  // 半长 GameVector2

---

## 4. GameBounds3 —— 三维轴对齐包围盒

### 构造函数
    new GameBounds3(lo, hi)                   // lo 与 hi 均为 GameVector3

### 静态方法
    GameBounds3.fromPoints(...points)         // 由多个 GameVector3 点计算包围盒

### 实例方法
    set(lox, loy, loz, hix, hiy, hiz)         // 直接设置
    copy(b) / clone()                         // 复制/克隆
    contains(v)                               // 是否包含 GameVector3 点
    intersects(b)                             // 与另一个 GameBounds3 是否相交
    intersect(b)                              // 返回相交部分（无重叠返回 null）
    containsBounds(b)                         // 是否完全包含另一个包围盒
    expand(v) / expandEq(v)                   // 扩展
    toBounds2()                               // 投影到 XY 平面，返回 GameBounds2

### 只读属性
    center                                    // 中心点 GameVector3
    size                                      // 尺寸 GameVector3
    halfSize                                  // 半长 GameVector3

---

## 5. GameQuaternion —— 四元数（旋转）

### 构造函数
    new GameQuaternion(w, x, y, z)

### 静态方法
    GameQuaternion.fromAxisAngle(axis, rad)   // 绕轴旋转（轴为 GameVector3，弧度）
    GameQuaternion.fromEuler(x, y, z)         // 从欧拉角（YZX 顺序）构建
    GameQuaternion.rotationBetween(a, b)      // 从向量 a 转到向量 b 的旋转

### 实例方法
    set(w, x, y, z)                           // 设置分量
    copy(q) / clone()                         // 复制/克隆
    add(q) / sub(q)                           // 四元数加减
    mul(q) / div(q)                           // 四元数乘法 / 除法（右乘）
    inv()                                     // 逆四元数
    normalize() / normalizeEq()               // 归一化
    slerp(q, t)                               // 球面线性插值
    angle(q)                                  // 两个四元数之间的夹角（弧度）
    getAxisAngle()                            // 返回 { axis: GameVector3, angle: number }
    rotateX(rad) / rotateY(rad) / rotateZ(rad) // 绕局部轴旋转

### 核心扩展功能
    rotateVector(v)                           // 将 GameVector3 向量旋转后返回
    toEuler()                                 // 转换为 GameEuler 欧拉角

---

## 6. GameEuler —— 欧拉角

### 构造函数
    new GameEuler(x, y, z, order)             // 顺序默认 YZX

### 静态方法
    GameEuler.fromQuaternion(q)               // 从四元数转换

### 实例方法
    set(x, y, z, order)                       // 重新设置
    setDegrees(xDeg, yDeg, zDeg)              // 以角度设置
    copy(e) / clone()                         // 复制/克隆
    normalize()                               // 将各轴归一化到 [-PI, PI]
    toQuaternion()                            // 转换为 GameQuaternion
    toVector3()                               // 将欧拉角视为方向向量，返回 GameVector3

### 只读属性
    degrees                                   // 返回 { x, y, z }，单位为度

---

## 7. GameOBBBounds3 —— 有向包围盒（OBB）

支持旋转体的精确碰撞检测，是物理引擎的核心几何体。

### 构造函数
    new GameOBBBounds3(center, halfSize, rotation)
    center     : GameVector3  世界空间中心
    halfSize   : GameVector3  局部半长（X/Y/Z 方向半径）
    rotation   : GameQuaternion 旋转四元数

### 实例方法
    set(center, halfSize, rotation)           // 重新设置
    getVertices()                             // 返回 8 个 GameVector3 顶点（世界空间）
    getAABB()                                 // 返回包围该 OBB 的 GameBounds3（轴对齐外包盒）

### 碰撞检测（物理引擎专用）
    intersectsOBB(other)                      // 与另一个 GameOBBBounds3 是否相交（bool）
    intersectsAABB(aabb)                      // 与 GameBounds3 是否相交（bool）
    getOverlapOBB(other)                      // 返回 { axis: GameVector3, depth: number } 或 null
    getOverlapAABB(aabb)                      // 返回 { axis: GameVector3, depth: number } 或 null

---

## 8. GameRGBColor —— RGB 颜色

### 构造函数
    new GameRGBColor(r, g, b)                 // r/g/b 范围 0~1

### 静态方法
    GameRGBColor.random()                     // 随机颜色
    GameRGBColor.fromHex(hex)                 // 从 "#RRGGBB" 字符串解析
    GameRGBColor.fromHSL(h, s, l)             // 从 HSL 创建
    GameRGBColor.fromInt(int)                 // 从整数 0xRRGGBB 创建

### 实例方法
    set(r, g, b)                              // 设置分量
    copy(c) / clone()                         // 复制/克隆
    add(c) / sub(c) / mul(c) / div(c)         // 颜色运算
    addEq / subEq / mulEq / divEq             // 修改自身
    lerp(c, t)                                // 插值
    equals(c)                                 // 相等比较
    toRGBA(a)                                 // 转为 GameRGBAColor，Alpha 默认 1
    toHSL()                                   // 返回 { h, s, l }
    toInt()                                   // 转为整数 0xRRGGBB

---

## 9. GameRGBAColor —— RGBA 颜色

### 构造函数
    new GameRGBAColor(r, g, b, a)             // a 范围 0~1

### 静态方法
    GameRGBAColor.fromHSL(h, s, l, a)         // 从 HSL + Alpha 创建
    GameRGBAColor.fromInt(int)                // 从整数 0xAARRGGBB 创建

### 实例方法
    set(r, g, b, a)                           // 设置分量
    copy(c) / clone()                         // 复制/克隆
    add / sub / mul / div                     // 颜色运算
    addEq / subEq / mulEq / divEq             // 修改自身
    lerp(c, t)                                // 插值
    equals(c)                                 // 相等比较
    toRGB()                                   // 丢弃 Alpha，返回 GameRGBColor
    blend(background)                         // 混合到背景色（返回 GameRGBColor）
    toHSL()                                   // 返回 { h, s, l, a }
    toInt()                                   // 转为整数 0xAARRGGBB

---

## 10. GameComplex —— 复数

### 构造函数
    new GameComplex(real, imag)

### 静态方法
    GameComplex.fromPolar(r, theta)           // 从极坐标创建
    GameComplex.fromAngle(theta)              // 单位复数（纯旋转）
    GameComplex.fromVector2(v)                // 从 GameVector2 创建

### 实例方法
    set(real, imag)                           // 设置
    copy(c) / clone()                         // 复制/克隆
    add(c) / sub(c) / mul(c) / div(c)         // 四则运算
    addEq / subEq / mulEq / divEq             // 修改自身
    scale(s) / scaleEq(s)                     // 标量乘法
    conj() / conjEq()                         // 共轭
    mag() / sqrMag()                          // 模长 / 平方模长
    angle()                                   // 辐角（弧度）
    normalize() / normalizeEq()               // 归一化
    toVector2()                               // 转为 GameVector2
    toVector3(z)                              // 转为 GameVector3（Z 默认 0）

---

## 11. GameBezierCurve —— 贝塞尔曲线

### 构造函数
    new GameBezierCurve(points)               // points 为 GameVector3 数组，至少 2 个点

### 实例方法
    getPoint(t)                               // 获取 t ∈ [0,1] 时的曲线点（GameVector3）
    getTangent(t)                             // 获取 t 处的切线向量
    getDirection(t)                           // 获取归一化切线方向
    sampleSteps(steps)                        // 返回 steps 个等间隔采样点
    length(steps)                             // 近似曲线长度
    clone()                                   // 复制曲线

---