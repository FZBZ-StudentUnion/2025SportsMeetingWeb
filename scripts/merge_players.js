const fs = require('fs');
const path = require('path');

// 定义目录路径
const playersDir = path.join(__dirname, '../public/data/players');
const outputFile = path.join(__dirname, '../public/data/players.json');

// 存储所有玩家数据的对象
const allPlayers = {};

// 读取players目录下的所有文件
const files = fs.readdirSync(playersDir);

// 过滤出JSON文件并排除output1目录
const jsonFiles = files.filter(file => 
  file.endsWith('.json') && !fs.statSync(path.join(playersDir, file)).isDirectory()
);

// 处理每个JSON文件
jsonFiles.forEach(file => {
  const filePath = path.join(playersDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // 使用文件名（不带扩展名）作为键
    const key = path.basename(file, '.json');
    allPlayers[key] = data;
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

// 将合并后的数据写入新文件
fs.writeFileSync(outputFile, JSON.stringify(allPlayers, null, 2));

console.log(`Successfully merged ${Object.keys(allPlayers).length} player files into ${outputFile}`);