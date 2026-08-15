# 游戏环境 API 文档

`environment` 是全局环境控制器，管理雾、光照、降水、风等效果。所有属性均为只读，可通过 `environment.属性名` 访问。

---

## 属性结构

### fog（雾）
- `color` : [r, g, b] 数组，各通道 0~1
- `density` : 雾的均匀密度
- `heightOffset` : 雾起始高度
- `heightFalloff` : 雾衰减速率
- `startDistance` : 雾起始距离
- `maxFog` : 最大雾量

### light（光照）
- `mode` : 'natural' 或 'manual'
- `sunPhase` : 太阳相位（0~1）
- `sunFrequency` : 太阳运动频率
- `sunDirection` : 太阳方向向量 [x, y, z]
- `sunLight` : 太阳光颜色亮度 [r, g, b]
- `ambient` : 六方向环境光，包含 left, right, bottom, top, front, back，每个为 [r, g, b]

### precipitation（降水）
- `type` : 'none', 'rain', 'snow' 之一
- `density` : 降水密度（0~1）
- `speed` : 下落速度
- `size` : 粒子大小
- `color` : 颜色 [r, g, b, a]
- `texture` : 自定义贴图路径（相对于沙盒根目录）
- `direction` : 下落方向 [x, y, z]

### wind（风）
- `speed` : 风速
- `direction` : 风向 [x, y, z]

---

## 示例

    // 获取当前雾的颜色
    console.log('雾颜色:', environment.fog.color);

    // 监听环境变化（通过事件系统）
    events.on('environment_state', (data) => {
        console.log('环境更新:', data);
    });