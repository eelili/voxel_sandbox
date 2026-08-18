// cdn.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class CDN {
    constructor(projectDir) {
        this.projectDir = projectDir;
        this.cache = {};               // 存放预压缩的小文件（如 block.gz）
        this.files = {
            meshes: [],    // .vox
            audio: [],     // .mp3
            textures: []   // .png
        };
    }

    load() {
        const tempDir = path.join(this.projectDir, 'temp');

        // 1. 预压缩 block.json（必须存在，否则生成空占位）
        const blockPath = path.join(tempDir, 'block.json');
        if (fs.existsSync(blockPath)) {
            const raw = fs.readFileSync(blockPath, 'utf-8');
            this.cache['block'] = zlib.gzipSync(raw);
            console.log(`✅ CDN: block.json 压缩成功 (${this.cache['block'].length} bytes)`);
        } else {
            console.warn('⚠️ CDN: temp/block.json 不存在，使用空数据');
            this.cache['block'] = zlib.gzipSync('{}');
        }

        // 2. 递归扫描所有 .vox, .mp3, .png
        this._scanFiles(tempDir);
        console.log(`✅ CDN: 扫描到 ${this.files.meshes.length} 个 .vox, ${this.files.audio.length} 个 .mp3, ${this.files.textures.length} 个 .png 文件`);

        return this;
    }

    _scanFiles(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this._scanFiles(fullPath);
            } else {
                const ext = path.extname(item).toLowerCase();
                // 相对于 temp 的路径，用于 URL
                const relative = path.relative(path.join(this.projectDir, 'temp'), fullPath);
                if (ext === '.vox') {
                    this.files.meshes.push(relative);
                } else if (ext === '.mp3') {
                    this.files.audio.push(relative);
                } else if (ext === '.png') {
                    this.files.textures.push(relative);
                }
            }
        }
    }

    register(app) {
        // ---------- 1. block.gz（预压缩缓存） ----------
        app.get('/assets/block.gz', (req, res) => {
            res.setHeader('Content-Type', 'application/gzip');
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.send(this.cache['block']);
        });

        // ---------- 2. .vox 文件（流式 Gzip 压缩，最小传输） ----------
        for (const relPath of this.files.meshes) {
            const url = `/assets/mesh/${relPath}`;
            const filePath = path.join(this.projectDir, 'temp', relPath);
            app.get(url, (req, res) => {
                if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Encoding', 'gzip');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                // 流式读取 → 压缩 → 发送，内存占用极小
                const gzip = zlib.createGzip();
                fs.createReadStream(filePath).pipe(gzip).pipe(res);
            });
        }

        // ---------- 3. .mp3 文件（原生压缩，直接发送 + 强缓存） ----------
        for (const relPath of this.files.audio) {
            const url = `/assets/audio/${relPath}`;
            const filePath = path.join(this.projectDir, 'temp', relPath);
            app.get(url, (req, res) => {
                if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存 1 天
                res.sendFile(filePath);
            });
        }

        // ---------- 4. .png 文件（原生压缩，直接发送 + 强缓存） ----------
        for (const relPath of this.files.textures) {
            const url = `/assets/texture/${relPath}`;
            const filePath = path.join(this.projectDir, 'temp', relPath);
            app.get(url, (req, res) => {
                if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                res.sendFile(filePath);
            });
        }

        // ---------- 5. manifest.json（动态生成，供客户端索引） ----------
        app.get('/assets/manifest.json', (req, res) => {
            const manifest = {
                block: '/assets/block.gz',
                meshes: this.files.meshes.map(f => `/assets/mesh/${f}`),
                audio: this.files.audio.map(f => `/assets/audio/${f}`),
                textures: this.files.textures.map(f => `/assets/texture/${f}`)
            };
            res.json(manifest);
        });

        console.log('🌐 CDN 路由已挂载，所有资产已按最小传输策略配置');
    }
}

module.exports = CDN;