/**
 * 数据库模块
 * 使用 better-sqlite3 创建 SQLite 数据库，定义表结构并插入初始数据
 */
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'nutrihealth.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// 创建所有表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    name TEXT,
    gender TEXT,
    age INTEGER,
    height REAL,
    weight REAL,
    bmi REAL,
    health_conditions TEXT,
    allergies TEXT,
    dietary_preferences TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS health_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    score INTEGER,
    risk_level TEXT,
    answers TEXT,
    suggestions TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    calories REAL,
    protein REAL,
    fat REAL,
    carbs REAL,
    fiber REAL,
    vitamins TEXT,
    minerals TEXT,
    unit TEXT DEFAULT '100g',
    image TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS diet_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_id INTEGER,
    food_name TEXT,
    meal_type TEXT,
    amount REAL,
    calories REAL,
    protein REAL,
    fat REAL,
    carbs REAL,
    date TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (food_id) REFERENCES foods(id)
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    ingredients TEXT,
    steps TEXT,
    nutrition TEXT,
    calories REAL,
    image TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS exercise_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    intensity TEXT,
    calories_per_hour REAL,
    description TEXT,
    suitable_for TEXT,
    precautions TEXT,
    duration INTEGER,
    image TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS exercise_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER,
    exercise_name TEXT,
    duration INTEGER,
    calories REAL,
    date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise_library(id)
  );

  CREATE TABLE IF NOT EXISTS knowledge_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    content TEXT,
    summary TEXT,
    tags TEXT,
    author TEXT,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT,
    title TEXT,
    content TEXT,
    data TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS qa_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT,
    answer TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

// 插入初始数据
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (userCount.count === 0) {
  // 插入食物数据（50+种中国常见食物）
  const insertFood = db.prepare(`
    INSERT INTO foods (name, category, calories, protein, fat, carbs, fiber, vitamins, minerals, unit)
    VALUES (@name, @category, @calories, @protein, @fat, @carbs, @fiber, @vitamins, @minerals, @unit)
  `)

  const foods = [
    { name: '米饭', category: '主食', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3, vitamins: 'B1,B2', minerals: '磷,钾', unit: '100g' },
    { name: '馒头', category: '主食', calories: 221, protein: 7.0, fat: 1.1, carbs: 47.0, fiber: 1.3, vitamins: 'B1,B2', minerals: '钙,磷', unit: '100g' },
    { name: '面条', category: '主食', calories: 137, protein: 4.5, fat: 0.6, carbs: 28.4, fiber: 0.8, vitamins: 'B1,B2', minerals: '磷,钾', unit: '100g' },
    { name: '小米粥', category: '主食', calories: 46, protein: 1.4, fat: 0.7, carbs: 8.4, fiber: 0.2, vitamins: 'B1,B2,E', minerals: '钾,镁', unit: '100g' },
    { name: '红薯', category: '主食', calories: 99, protein: 1.1, fat: 0.2, carbs: 23.1, fiber: 1.6, vitamins: 'A,C,E', minerals: '钾,钙', unit: '100g' },
    { name: '玉米', category: '主食', calories: 112, protein: 4.0, fat: 1.2, carbs: 22.8, fiber: 2.9, vitamins: 'A,B1,B2,C', minerals: '钾,镁', unit: '100g' },
    { name: '燕麦', category: '主食', calories: 377, protein: 13.5, fat: 6.7, carbs: 66.9, fiber: 10.3, vitamins: 'B1,B2,E', minerals: '钙,铁,锌', unit: '100g' },
    { name: '全麦面包', category: '主食', calories: 246, protein: 8.5, fat: 3.5, carbs: 45.5, fiber: 6.0, vitamins: 'B1,B2,E', minerals: '钙,铁', unit: '100g' },
    { name: '鸡胸肉', category: '肉类', calories: 133, protein: 31.0, fat: 3.6, carbs: 0, fiber: 0, vitamins: 'B3,B6', minerals: '磷,硒', unit: '100g' },
    { name: '猪里脊', category: '肉类', calories: 155, protein: 20.2, fat: 7.9, carbs: 1.5, fiber: 0, vitamins: 'B1,B6,B12', minerals: '铁,锌', unit: '100g' },
    { name: '牛腱子', category: '肉类', calories: 125, protein: 23.1, fat: 3.5, carbs: 0, fiber: 0, vitamins: 'B3,B6,B12', minerals: '铁,锌,硒', unit: '100g' },
    { name: '羊腿肉', category: '肉类', calories: 203, protein: 19.7, fat: 14.1, carbs: 0, fiber: 0, vitamins: 'B3,B6,B12', minerals: '铁,锌', unit: '100g' },
    { name: '鸭肉', category: '肉类', calories: 240, protein: 15.5, fat: 19.7, carbs: 0.1, fiber: 0, vitamins: 'B3,B6', minerals: '铁,锌', unit: '100g' },
    { name: '草鱼', category: '水产', calories: 113, protein: 16.6, fat: 5.2, carbs: 0, fiber: 0, vitamins: 'A,D,E', minerals: '钙,磷,硒', unit: '100g' },
    { name: '三文鱼', category: '水产', calories: 139, protein: 17.2, fat: 7.8, carbs: 0, fiber: 0, vitamins: 'A,D,E,B12', minerals: '钙,磷,硒', unit: '100g' },
    { name: '虾仁', category: '水产', calories: 87, protein: 18.6, fat: 0.8, carbs: 1.0, fiber: 0, vitamins: 'A,E', minerals: '钙,磷,碘', unit: '100g' },
    { name: '带鱼', category: '水产', calories: 127, protein: 17.7, fat: 4.9, carbs: 3.1, fiber: 0, vitamins: 'A,D', minerals: '钙,磷,碘', unit: '100g' },
    { name: '鲈鱼', category: '水产', calories: 105, protein: 18.6, fat: 3.4, carbs: 0, fiber: 0, vitamins: 'A,D,B12', minerals: '钙,磷', unit: '100g' },
    { name: '鸡蛋', category: '蛋奶', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8, fiber: 0, vitamins: 'A,D,E,B2,B12', minerals: '钙,磷,铁', unit: '100g' },
    { name: '牛奶', category: '蛋奶', calories: 54, protein: 3.0, fat: 3.2, carbs: 3.4, fiber: 0, vitamins: 'A,D,B2,B12', minerals: '钙,磷,钾', unit: '100ml' },
    { name: '酸奶', category: '蛋奶', calories: 72, protein: 2.5, fat: 2.7, carbs: 9.3, fiber: 0, vitamins: 'A,B2,B12', minerals: '钙,磷', unit: '100ml' },
    { name: '豆腐', category: '豆制品', calories: 81, protein: 8.1, fat: 3.7, carbs: 4.2, fiber: 0.4, vitamins: 'B1,B2,E', minerals: '钙,铁,镁', unit: '100g' },
    { name: '豆浆', category: '豆制品', calories: 31, protein: 3.0, fat: 1.6, carbs: 1.2, fiber: 1.1, vitamins: 'B1,B2,E', minerals: '钙,铁', unit: '100ml' },
    { name: '腐竹', category: '豆制品', calories: 461, protein: 44.6, fat: 21.7, carbs: 22.3, fiber: 1.0, vitamins: 'B1,B2,E', minerals: '钙,铁,锌', unit: '100g' },
    { name: '西兰花', category: '蔬菜', calories: 36, protein: 4.1, fat: 0.6, carbs: 4.3, fiber: 1.6, vitamins: 'A,C,K,B6', minerals: '钙,钾,镁', unit: '100g' },
    { name: '菠菜', category: '蔬菜', calories: 28, protein: 2.6, fat: 0.3, carbs: 4.5, fiber: 1.7, vitamins: 'A,C,K,叶酸', minerals: '铁,钙,镁', unit: '100g' },
    { name: '胡萝卜', category: '蔬菜', calories: 37, protein: 1.0, fat: 0.2, carbs: 8.1, fiber: 2.7, vitamins: 'A,C,K,B6', minerals: '钾,钙', unit: '100g' },
    { name: '番茄', category: '蔬菜', calories: 19, protein: 0.9, fat: 0.2, carbs: 4.0, fiber: 0.5, vitamins: 'A,C,K,番茄红素', minerals: '钾,镁', unit: '100g' },
    { name: '黄瓜', category: '蔬菜', calories: 15, protein: 0.8, fat: 0.2, carbs: 2.9, fiber: 0.5, vitamins: 'C,K', minerals: '钾,硅', unit: '100g' },
    { name: '白菜', category: '蔬菜', calories: 17, protein: 1.5, fat: 0.1, carbs: 3.2, fiber: 0.8, vitamins: 'A,C,K', minerals: '钙,钾', unit: '100g' },
    { name: '芹菜', category: '蔬菜', calories: 14, protein: 0.8, fat: 0.1, carbs: 2.6, fiber: 1.2, vitamins: 'A,C,K', minerals: '钾,钙', unit: '100g' },
    { name: '茄子', category: '蔬菜', calories: 23, protein: 1.1, fat: 0.2, carbs: 4.9, fiber: 1.3, vitamins: 'C,K,B6', minerals: '钾,镁', unit: '100g' },
    { name: '青椒', category: '蔬菜', calories: 22, protein: 1.0, fat: 0.2, carbs: 5.4, fiber: 1.4, vitamins: 'A,C,B6', minerals: '钾,镁', unit: '100g' },
    { name: '苹果', category: '水果', calories: 53, protein: 0.2, fat: 0.2, carbs: 13.5, fiber: 1.2, vitamins: 'C,K', minerals: '钾,钙', unit: '100g' },
    { name: '香蕉', category: '水果', calories: 93, protein: 1.4, fat: 0.2, carbs: 22.0, fiber: 1.2, vitamins: 'B6,C', minerals: '钾,镁', unit: '100g' },
    { name: '橙子', category: '水果', calories: 48, protein: 0.8, fat: 0.2, carbs: 11.1, fiber: 0.6, vitamins: 'C,A,B1', minerals: '钾,钙', unit: '100g' },
    { name: '葡萄', category: '水果', calories: 44, protein: 0.5, fat: 0.2, carbs: 10.3, fiber: 0.4, vitamins: 'C,K', minerals: '钾,铁', unit: '100g' },
    { name: '西瓜', category: '水果', calories: 31, protein: 0.5, fat: 0.1, carbs: 6.8, fiber: 0.3, vitamins: 'A,C', minerals: '钾,镁', unit: '100g' },
    { name: '猕猴桃', category: '水果', calories: 56, protein: 0.8, fat: 0.6, carbs: 11.9, fiber: 2.6, vitamins: 'C,E,K', minerals: '钾,钙', unit: '100g' },
    { name: '草莓', category: '水果', calories: 30, protein: 1.0, fat: 0.2, carbs: 7.1, fiber: 1.1, vitamins: 'C,K,叶酸', minerals: '钾,镁', unit: '100g' },
    { name: '核桃', category: '坚果', calories: 646, protein: 14.9, fat: 58.8, carbs: 19.1, fiber: 9.5, vitamins: 'E,B1,B6', minerals: '钙,铁,锌', unit: '100g' },
    { name: '花生', category: '坚果', calories: 563, protein: 24.8, fat: 44.3, carbs: 21.7, fiber: 5.5, vitamins: 'E,B1,B3', minerals: '钙,铁,锌', unit: '100g' },
    { name: '杏仁', category: '坚果', calories: 578, protein: 22.0, fat: 45.4, carbs: 23.5, fiber: 8.0, vitamins: 'E,B2', minerals: '钙,镁,铁', unit: '100g' },
    { name: '腰果', category: '坚果', calories: 559, protein: 17.3, fat: 36.7, carbs: 41.6, fiber: 3.6, vitamins: 'E,B1', minerals: '镁,锌', unit: '100g' },
    { name: '红枣', category: '水果', calories: 125, protein: 1.2, fat: 0.2, carbs: 30.5, fiber: 1.9, vitamins: 'C,A,B1', minerals: '铁,钙,钾', unit: '100g' },
    { name: '银耳', category: '其他', calories: 200, protein: 10.0, fat: 1.4, carbs: 67.3, fiber: 30.4, vitamins: 'D', minerals: '钙,磷,铁', unit: '100g' },
    { name: '黑木耳', category: '其他', calories: 205, protein: 12.1, fat: 1.5, carbs: 65.6, fiber: 29.9, vitamins: 'B1,B2,K', minerals: '铁,钙,磷', unit: '100g' },
    { name: '香菇', category: '蔬菜', calories: 19, protein: 2.2, fat: 0.3, carbs: 5.2, fiber: 3.3, vitamins: 'D,B2', minerals: '钾,磷', unit: '100g' },
    { name: '海带', category: '蔬菜', calories: 12, protein: 1.2, fat: 0.1, carbs: 2.1, fiber: 0.5, vitamins: 'A,K', minerals: '碘,钙,铁', unit: '100g' },
    { name: '紫菜', category: '蔬菜', calories: 207, protein: 26.7, fat: 1.1, carbs: 44.1, fiber: 21.6, vitamins: 'A,B1,B2,B12', minerals: '碘,钙,铁', unit: '100g' },
    { name: '莲藕', category: '蔬菜', calories: 73, protein: 2.0, fat: 0.2, carbs: 16.4, fiber: 1.2, vitamins: 'C,B6', minerals: '钾,铁', unit: '100g' },
    { name: '山药', category: '蔬菜', calories: 57, protein: 1.9, fat: 0.2, carbs: 12.4, fiber: 0.8, vitamins: 'C,B6', minerals: '钾,镁', unit: '100g' },
    { name: '南瓜', category: '蔬菜', calories: 23, protein: 0.7, fat: 0.1, carbs: 5.3, fiber: 0.8, vitamins: 'A,C,E', minerals: '钾,钙', unit: '100g' },
    { name: '冬瓜', category: '蔬菜', calories: 11, protein: 0.4, fat: 0.2, carbs: 2.4, fiber: 0.7, vitamins: 'C', minerals: '钾', unit: '100g' },
  ]

  const insertFoodsTx = db.transaction(() => {
    for (const food of foods) {
      insertFood.run(food)
    }
  })
  insertFoodsTx()

  // 插入食谱数据（20个中式食谱）
  const insertRecipe = db.prepare(`
    INSERT INTO recipes (name, category, description, ingredients, steps, nutrition, calories, tags)
    VALUES (@name, @category, @description, @ingredients, @steps, @nutrition, @calories, @tags)
  `)

  const recipes = [
    {
      name: '番茄炒蛋', category: '家常菜', description: '经典家常菜，酸甜可口，营养丰富',
      ingredients: '[{"name":"番茄","amount":"2个"},{"name":"鸡蛋","amount":"3个"},{"name":"葱花","amount":"适量"},{"name":"盐","amount":"3g"},{"name":"糖","amount":"5g"},{"name":"食用油","amount":"15ml"}]',
      steps: '["番茄切块，鸡蛋打散加少许盐搅匀","热锅凉油，倒入蛋液炒至凝固盛出","锅中加油，放入番茄翻炒出汁","加入糖、盐调味","倒入炒好的鸡蛋翻炒均匀","撒上葱花出锅"]',
      nutrition: '{"protein":12,"fat":15,"carbs":8}', calories: 215, tags: '家常,快手,下饭'
    },
    {
      name: '清蒸鲈鱼', category: '海鲜', description: '鲜嫩爽滑，保留鱼的原汁原味',
      ingredients: '[{"name":"鲈鱼","amount":"1条"},{"name":"姜丝","amount":"10g"},{"name":"葱丝","amount":"15g"},{"name":"蒸鱼豉油","amount":"20ml"},{"name":"料酒","amount":"10ml"},{"name":"食用油","amount":"10ml"}]',
      steps: '["鲈鱼处理干净，两面划刀","鱼身抹料酒和少许盐，放上姜丝","大火蒸8-10分钟","取出倒掉蒸出的汤汁","铺上葱丝，淋上蒸鱼豉油","热油浇在葱丝上即可"]',
      nutrition: '{"protein":28,"fat":5,"carbs":3}', calories: 168, tags: '清淡,高蛋白,低脂'
    },
    {
      name: '宫保鸡丁', category: '川菜', description: '麻辣鲜香，花生酥脆，经典川菜代表',
      ingredients: '[{"name":"鸡胸肉","amount":"300g"},{"name":"花生米","amount":"50g"},{"name":"干辣椒","amount":"8个"},{"name":"花椒","amount":"10粒"},{"name":"葱姜蒜","amount":"适量"},{"name":"酱油","amount":"15ml"},{"name":"醋","amount":"10ml"},{"name":"糖","amount":"8g"}]',
      steps: '["鸡胸肉切丁，用料酒、酱油、淀粉腌制15分钟","花生米炸至酥脆备用","调制碗汁：酱油、醋、糖、淀粉水","热油爆香花椒、干辣椒","放入鸡丁滑炒至变色","倒入碗汁翻炒，加入花生米拌匀"]',
      nutrition: '{"protein":32,"fat":18,"carbs":10}', calories: 328, tags: '川菜,下饭,麻辣'
    },
    {
      name: '麻婆豆腐', category: '川菜', description: '麻辣鲜香嫩，豆腐入味，下饭神器',
      ingredients: '[{"name":"嫩豆腐","amount":"400g"},{"name":"猪肉末","amount":"100g"},{"name":"豆瓣酱","amount":"20g"},{"name":"花椒粉","amount":"3g"},{"name":"辣椒面","amount":"5g"},{"name":"葱花","amount":"适量"},{"name":"淀粉","amount":"10g"}]',
      steps: '["豆腐切小块，焯水备用","热油炒肉末至变色","加入豆瓣酱、辣椒面炒出红油","加入适量水烧开","放入豆腐小火炖5分钟","勾芡撒花椒粉和葱花"]',
      nutrition: '{"protein":18,"fat":14,"carbs":8}', calories: 228, tags: '川菜,麻辣,下饭'
    },
    {
      name: '红烧排骨', category: '家常菜', description: '色泽红亮，肉质酥烂，味道浓郁',
      ingredients: '[{"name":"猪小排","amount":"500g"},{"name":"冰糖","amount":"20g"},{"name":"酱油","amount":"20ml"},{"name":"料酒","amount":"15ml"},{"name":"八角","amount":"2个"},{"name":"桂皮","amount":"1小块"},{"name":"葱姜","amount":"适量"}]',
      steps: '["排骨焯水去血沫","锅中放油，小火炒冰糖至焦糖色","放入排骨翻炒上色","加入料酒、酱油、葱姜、八角、桂皮","加入热水没过排骨","大火烧开转小火炖40分钟","大火收汁即可"]',
      nutrition: '{"protein":28,"fat":22,"carbs":12}', calories: 358, tags: '家常,硬菜,下饭'
    },
    {
      name: '蒜蓉西兰花', category: '素菜', description: '清淡健康，蒜香浓郁，营养保留完整',
      ingredients: '[{"name":"西兰花","amount":"300g"},{"name":"大蒜","amount":"5瓣"},{"name":"盐","amount":"3g"},{"name":"食用油","amount":"10ml"},{"name":"蚝油","amount":"5ml"}]',
      steps: '["西兰花掰小朵，焯水1分钟","大蒜切末","热油爆香蒜末","放入西兰花翻炒","加盐和蚝油调味","翻炒均匀出锅"]',
      nutrition: '{"protein":5,"fat":6,"carbs":6}', calories: 98, tags: '素菜,快手,低脂'
    },
    {
      name: '酸辣土豆丝', category: '家常菜', description: '酸辣爽脆，开胃下饭，国民家常菜',
      ingredients: '[{"name":"土豆","amount":"2个"},{"name":"干辣椒","amount":"5个"},{"name":"花椒","amount":"8粒"},{"name":"醋","amount":"15ml"},{"name":"盐","amount":"3g"},{"name":"葱花","amount":"适量"}]',
      steps: '["土豆切丝，泡水去淀粉","热油爆香花椒、干辣椒","放入土豆丝大火翻炒","沿锅边淋入醋","加盐调味继续翻炒","撒上葱花出锅"]',
      nutrition: '{"protein":3,"fat":8,"carbs":18}', calories: 152, tags: '家常,快手,下饭'
    },
    {
      name: '小米南瓜粥', category: '粥品', description: '养胃暖身，口感绵密，适合早餐',
      ingredients: '[{"name":"小米","amount":"100g"},{"name":"南瓜","amount":"200g"},{"name":"冰糖","amount":"15g"},{"name":"清水","amount":"800ml"}]',
      steps: '["小米淘洗干净","南瓜去皮切块","锅中加水烧开，放入小米","大火煮开转小火煮20分钟","加入南瓜块继续煮15分钟","加冰糖调味至融化"]',
      nutrition: '{"protein":4,"fat":1,"carbs":22}', calories: 112, tags: '粥品,养胃,早餐'
    },
    {
      name: '鱼香肉丝', category: '川菜', description: '酸甜微辣，肉丝嫩滑，经典川菜',
      ingredients: '[{"name":"猪里脊","amount":"250g"},{"name":"木耳","amount":"50g"},{"name":"胡萝卜","amount":"1根"},{"name":"青椒","amount":"1个"},{"name":"豆瓣酱","amount":"15g"},{"name":"醋","amount":"10ml"},{"name":"糖","amount":"10g"},{"name":"酱油","amount":"10ml"}]',
      steps: '["里脊肉切丝，用料酒、淀粉腌制","木耳泡发，胡萝卜、青椒切丝","调制鱼香汁：醋、糖、酱油、淀粉水","热油滑炒肉丝盛出","爆香豆瓣酱，放入蔬菜丝翻炒","倒入肉丝和鱼香汁翻炒均匀"]',
      nutrition: '{"protein":22,"fat":12,"carbs":14}', calories: 252, tags: '川菜,下饭,经典'
    },
    {
      name: '白切鸡', category: '粤菜', description: '皮爽肉滑，原汁原味，粤菜经典',
      ingredients: '[{"name":"三黄鸡","amount":"1只"},{"name":"姜","amount":"30g"},{"name":"葱","amount":"50g"},{"name":"料酒","amount":"20ml"},{"name":"香油","amount":"10ml"},{"name":"生抽","amount":"15ml"}]',
      steps: '["鸡处理干净，锅中加水放入姜葱料酒","水开后放入鸡，提起三次","小火浸煮20分钟","取出放入冰水中浸泡","斩块装盘","姜葱切末加生抽香油做蘸料"]',
      nutrition: '{"protein":35,"fat":12,"carbs":1}', calories: 248, tags: '粤菜,清淡,高蛋白'
    },
    {
      name: '西红柿牛腩', category: '家常菜', description: '牛肉酥烂，汤汁浓郁，营养丰富',
      ingredients: '[{"name":"牛腩","amount":"500g"},{"name":"番茄","amount":"3个"},{"name":"土豆","amount":"1个"},{"name":"洋葱","amount":"半个"},{"name":"番茄酱","amount":"30g"},{"name":"盐","amount":"5g"},{"name":"八角","amount":"2个"}]',
      steps: '["牛腩切块焯水","番茄去皮切块，土豆切块","热油炒洋葱出香","加入番茄炒出汁","放入牛腩和番茄酱","加水没过食材，大火烧开转小火炖1.5小时","加入土豆继续炖20分钟，调味出锅"]',
      nutrition: '{"protein":30,"fat":15,"carbs":16}', calories: 318, tags: '家常,炖菜,高蛋白'
    },
    {
      name: '蛋炒饭', category: '主食', description: '简单快手，粒粒分明，经典主食',
      ingredients: '[{"name":"隔夜米饭","amount":"300g"},{"name":"鸡蛋","amount":"2个"},{"name":"葱花","amount":"15g"},{"name":"盐","amount":"3g"},{"name":"酱油","amount":"5ml"},{"name":"食用油","amount":"15ml"}]',
      steps: '["鸡蛋打散，米饭提前打散","热锅凉油，倒入蛋液","蛋液半凝固时倒入米饭","大火快速翻炒，使米饭粒粒分明","加盐和酱油调味","撒葱花翻炒均匀出锅"]',
      nutrition: '{"protein":10,"fat":14,"carbs":45}', calories: 342, tags: '主食,快手,经典'
    },
    {
      name: '糖醋里脊', category: '家常菜', description: '外酥里嫩，酸甜可口，老少皆宜',
      ingredients: '[{"name":"猪里脊","amount":"300g"},{"name":"淀粉","amount":"50g"},{"name":"番茄酱","amount":"30g"},{"name":"醋","amount":"20ml"},{"name":"糖","amount":"25g"},{"name":"料酒","amount":"10ml"}]',
      steps: '["里脊肉切条，用料酒、盐腌制","裹上淀粉糊","油温六成热炸至金黄捞出","复炸一次更酥脆","锅中加番茄酱、醋、糖、少量水熬汁","倒入炸好的里脊翻炒均匀"]',
      nutrition: '{"protein":20,"fat":18,"carbs":25}', calories: 338, tags: '家常,酸甜,下饭'
    },
    {
      name: '皮蛋瘦肉粥', category: '粥品', description: '鲜香绵滑，传统广式粥品',
      ingredients: '[{"name":"大米","amount":"100g"},{"name":"皮蛋","amount":"2个"},{"name":"猪瘦肉","amount":"100g"},{"name":"姜丝","amount":"10g"},{"name":"葱花","amount":"10g"},{"name":"盐","amount":"3g"}]',
      steps: '["大米洗净加少许油盐腌制30分钟","瘦肉切丝用盐和淀粉腌制","皮蛋切小块","锅中加水烧开，放入大米","大火煮开转小火煮40分钟","加入肉丝和皮蛋继续煮15分钟","加盐调味，撒葱花"]',
      nutrition: '{"protein":14,"fat":8,"carbs":25}', calories: 228, tags: '粥品,早餐,广式'
    },
    {
      name: '清炒时蔬', category: '素菜', description: '时令蔬菜清炒，保留原味和营养',
      ingredients: '[{"name":"时令蔬菜","amount":"300g"},{"name":"大蒜","amount":"3瓣"},{"name":"盐","amount":"3g"},{"name":"食用油","amount":"10ml"}]',
      steps: '["蔬菜洗净沥干","大蒜切片","热油爆香蒜片","大火放入蔬菜翻炒","加盐调味","炒至断生即可出锅"]',
      nutrition: '{"protein":3,"fat":6,"carbs":5}', calories: 82, tags: '素菜,快手,低脂'
    },
    {
      name: '红烧豆腐', category: '素菜', description: '豆腐入味，咸香下饭，素食佳品',
      ingredients: '[{"name":"老豆腐","amount":"400g"},{"name":"酱油","amount":"15ml"},{"name":"蚝油","amount":"10ml"},{"name":"糖","amount":"5g"},{"name":"葱姜蒜","amount":"适量"},{"name":"淀粉","amount":"10g"}]',
      steps: '["豆腐切块，用厨房纸吸干水分","热油将豆腐煎至两面金黄","加入葱姜蒜爆香","加酱油、蚝油、糖和适量水","小火炖5分钟使豆腐入味","勾芡出锅"]',
      nutrition: '{"protein":14,"fat":10,"carbs":8}', calories: 178, tags: '素菜,下饭,高蛋白'
    },
    {
      name: '紫菜蛋花汤', category: '汤品', description: '简单快手，鲜美营养，家常汤品',
      ingredients: '[{"name":"紫菜","amount":"10g"},{"name":"鸡蛋","amount":"2个"},{"name":"香油","amount":"5ml"},{"name":"盐","amount":"3g"},{"name":"葱花","amount":"5g"}]',
      steps: '["紫菜撕碎泡水","鸡蛋打散","锅中加水烧开","放入紫菜煮2分钟","淋入蛋液，轻轻搅动","加盐、香油调味，撒葱花"]',
      nutrition: '{"protein":8,"fat":6,"carbs":3}', calories: 98, tags: '汤品,快手,家常'
    },
    {
      name: '可乐鸡翅', category: '家常菜', description: '甜香入味，色泽诱人，深受年轻人喜爱',
      ingredients: '[{"name":"鸡翅","amount":"10个"},{"name":"可乐","amount":"300ml"},{"name":"酱油","amount":"15ml"},{"name":"姜片","amount":"10g"},{"name":"料酒","amount":"10ml"}]',
      steps: '["鸡翅划刀，焯水去血沫","热油煎至两面微黄","加入姜片、料酒、酱油","倒入可乐没过鸡翅","大火烧开转小火炖20分钟","大火收汁至浓稠"]',
      nutrition: '{"protein":24,"fat":14,"carbs":18}', calories: 292, tags: '家常,甜味,下饭'
    },
    {
      name: '银耳红枣羹', category: '甜品', description: '滋阴润燥，美容养颜，传统甜品',
      ingredients: '[{"name":"银耳","amount":"20g"},{"name":"红枣","amount":"10颗"},{"name":"枸杞","amount":"10g"},{"name":"冰糖","amount":"30g"},{"name":"清水","amount":"1000ml"}]',
      steps: '["银耳泡发撕小朵","红枣洗净去核","锅中加水放入银耳","大火烧开转小火煮1小时","加入红枣和冰糖继续煮20分钟","最后加入枸杞煮5分钟"]',
      nutrition: '{"protein":2,"fat":0.5,"carbs":20}', calories: 92, tags: '甜品,养生,美容'
    },
    {
      name: '葱油拌面', category: '主食', description: '葱香浓郁，简单美味，上海经典',
      ingredients: '[{"name":"面条","amount":"200g"},{"name":"小葱","amount":"100g"},{"name":"酱油","amount":"30ml"},{"name":"糖","amount":"10g"},{"name":"食用油","amount":"50ml"}]',
      steps: '["小葱切段，葱白葱绿分开","锅中倒油，小火炸葱段至深褐色","酱油加糖调匀","面条煮熟捞出","将葱油和酱汁浇在面条上","拌匀即可"]',
      nutrition: '{"protein":6,"fat":20,"carbs":40}', calories: 358, tags: '主食,快手,上海'
    },
  ]

  const insertRecipesTx = db.transaction(() => {
    for (const recipe of recipes) {
      insertRecipe.run(recipe)
    }
  })
  insertRecipesTx()

  // 插入运动库数据（15种运动）
  const insertExercise = db.prepare(`
    INSERT INTO exercise_library (name, category, intensity, calories_per_hour, description, suitable_for, precautions, duration)
    VALUES (@name, @category, @intensity, @calories_per_hour, @description, @suitable_for, @precautions, @duration)
  `)

  const exercises = [
    { name: '快走', category: '有氧运动', intensity: '低', calories_per_hour: 280, description: '中等速度步行，适合日常锻炼', suitable_for: '所有人群，尤其适合老年人和初学者', precautions: '选择平坦路面，穿舒适运动鞋', duration: 30 },
    { name: '慢跑', category: '有氧运动', intensity: '中', calories_per_hour: 400, description: '匀速慢跑，有效提升心肺功能', suitable_for: '健康成年人，有一定运动基础者', precautions: '注意热身，避免空腹跑步，膝关节不适者慎选', duration: 30 },
    { name: '游泳', category: '有氧运动', intensity: '中', calories_per_hour: 500, description: '全身性有氧运动，对关节压力小', suitable_for: '所有人群，关节不适者优选', precautions: '饭后1小时再游泳，注意水温，初学者需有人陪同', duration: 45 },
    { name: '骑自行车', category: '有氧运动', intensity: '中', calories_per_hour: 380, description: '户外骑行或室内动感单车', suitable_for: '健康成年人', precautions: '注意交通安全，调整座椅高度，佩戴头盔', duration: 40 },
    { name: '跳绳', category: '有氧运动', intensity: '高', calories_per_hour: 600, description: '高效燃脂运动，提升协调性', suitable_for: '健康成年人，青少年', precautions: '选择软质地面，穿减震鞋，膝关节不适者避免', duration: 20 },
    { name: '瑜伽', category: '柔韧训练', intensity: '低', calories_per_hour: 200, description: '身心结合的运动，提升柔韧性和平衡感', suitable_for: '所有人群，尤其适合压力大的上班族', precautions: '循序渐进，不要勉强做高难度动作', duration: 60 },
    { name: '太极拳', category: '柔韧训练', intensity: '低', calories_per_hour: 180, description: '传统养生运动，动作缓慢柔和', suitable_for: '中老年人，康复期人群', precautions: '注意呼吸配合，动作要连贯', duration: 30 },
    { name: '力量训练', category: '力量训练', intensity: '高', calories_per_hour: 350, description: '使用哑铃、器械等进行抗阻训练', suitable_for: '健康成年人', precautions: '注意正确姿势，循序渐进增加重量，避免憋气', duration: 45 },
    { name: '俯卧撑', category: '力量训练', intensity: '中', calories_per_hour: 300, description: '经典上肢力量训练，锻炼胸肌和手臂', suitable_for: '健康成年人', precautions: '保持身体一条直线，避免塌腰', duration: 15 },
    { name: '平板支撑', category: '核心训练', intensity: '中', calories_per_hour: 250, description: '核心稳定性训练，增强腹部力量', suitable_for: '健康成年人', precautions: '保持身体一条直线，不要塌腰或翘臀', duration: 10 },
    { name: '羽毛球', category: '球类运动', intensity: '中', calories_per_hour: 420, description: '趣味性强的球类运动，锻炼反应能力', suitable_for: '健康成年人，青少年', precautions: '注意热身手腕和脚踝，穿专业运动鞋', duration: 60 },
    { name: '乒乓球', category: '球类运动', intensity: '低', calories_per_hour: 260, description: '对反应速度和手眼协调要求高', suitable_for: '所有年龄段', precautions: '注意握拍姿势，避免手腕过度用力', duration: 45 },
    { name: '登山', category: '户外运动', intensity: '高', calories_per_hour: 450, description: '户外有氧运动，亲近自然', suitable_for: '健康成年人', precautions: '注意防晒和补水，选择合适路线，穿登山鞋', duration: 120 },
    { name: '广场舞', category: '有氧运动', intensity: '低', calories_per_hour: 220, description: '集体舞蹈运动，兼具社交功能', suitable_for: '中老年人', precautions: '选择平坦场地，注意节奏不要过快', duration: 60 },
    { name: '八段锦', category: '柔韧训练', intensity: '低', calories_per_hour: 150, description: '传统养生功法，八个动作调理五脏六腑', suitable_for: '所有人群，尤其适合中老年人', precautions: '动作要柔和缓慢，配合呼吸', duration: 20 },
  ]

  const insertExercisesTx = db.transaction(() => {
    for (const exercise of exercises) {
      insertExercise.run(exercise)
    }
  })
  insertExercisesTx()

  // 插入知识文章数据（20篇中文知识文章）
  const insertArticle = db.prepare(`
    INSERT INTO knowledge_articles (title, category, content, summary, tags, author, views)
    VALUES (@title, @category, @content, @summary, @tags, @author, @views)
  `)

  const articles = [
    {
      title: '中国居民膳食指南核心要点', category: '营养基础',
      content: '中国居民膳食指南（2022版）提出了8条核心准则：\n\n1. 食物多样，合理搭配\n每天摄入12种以上食物，每周25种以上。谷薯类、蔬菜水果类、畜禽鱼蛋奶类、大豆坚果类都要兼顾。\n\n2. 吃动平衡，健康体重\n每周至少5天中等强度身体活动，累计150分钟以上；主动身体活动每天6000步以上。\n\n3. 多吃蔬果、奶类、全谷、大豆\n餐餐有蔬菜，保证每天摄入不少于300g新鲜蔬菜，深色蔬菜占1/2；天天吃水果，保证每天摄入200-350g新鲜水果。\n\n4. 适量吃鱼、禽、蛋、瘦肉\n动物性食物每天120-200g，每周最好吃鱼2次或300-500g；蛋类300-350g/周。\n\n5. 少盐少油，控糖限酒\n成年人每天食盐不超过5g，烹调油25-30g，添加糖不超过50g最好25g以下。\n\n6. 规律进餐，足量饮水\n合理安排一日三餐，每天饮水1500-1700ml。\n\n7. 会烹会选，会看标签\n学会阅读食品标签，合理选择预包装食品。\n\n8. 公筷分餐，杜绝浪费\n使用公筷公勺，预防疾病传播。',
      summary: '中国居民膳食指南2022版8条核心准则，指导科学饮食', tags: '膳食指南,营养,健康饮食', author: '营养科', views: 1520
    },
    {
      title: 'BMI指数详解与健康体重管理', category: '健康指标',
      content: 'BMI（Body Mass Index）即身体质量指数，是衡量人体胖瘦程度的重要指标。\n\n计算公式：BMI = 体重(kg) ÷ 身高(m)²\n\n中国成人BMI分类标准：\n- 偏瘦：BMI < 18.5\n- 正常：18.5 ≤ BMI < 24.0\n- 超重：24.0 ≤ BMI < 28.0\n- 肥胖：BMI ≥ 28.0\n\n体重管理建议：\n1. 合理控制总能量摄入\n2. 增加蛋白质和膳食纤维摄入\n3. 减少高糖高脂食物\n4. 坚持规律运动\n5. 保证充足睡眠\n\n注意：BMI不能完全反映身体组成，运动员和老年人需结合体脂率等指标综合评估。',
      summary: 'BMI指数计算方法与中国标准，健康体重管理建议', tags: 'BMI,体重管理,健康指标', author: '营养科', views: 2340
    },
    {
      title: '孕期营养全攻略', category: '特殊人群',
      content: '孕期营养对母婴健康至关重要，不同阶段有不同需求：\n\n孕早期（1-3月）：\n- 补充叶酸：每天400μg，预防神经管缺陷\n- 缓解孕吐：少食多餐，选择清淡食物\n- 保证碳水化合物摄入\n\n孕中期（4-6月）：\n- 增加蛋白质：每天增加15g\n- 补铁：预防贫血，多吃红肉、动物肝脏\n- 补钙：每天1000mg，牛奶、豆制品\n- 补DHA：每周吃2-3次深海鱼\n\n孕晚期（7-9月）：\n- 继续增加蛋白质：每天增加30g\n- 控制体重增长：每周不超过0.5kg\n- 补充维生素K：预防新生儿出血\n- 少盐饮食：预防水肿和妊娠高血压\n\n孕期禁忌：\n- 禁酒\n- 避免生食\n- 限制咖啡因\n- 避免高汞鱼类',
      summary: '孕期各阶段营养需求与饮食建议，保障母婴健康', tags: '孕期,营养,母婴健康', author: '妇产科', views: 1856
    },
    {
      title: '老年人营养与饮食指导', category: '特殊人群',
      content: '随着年龄增长，老年人的营养需求和消化能力发生变化：\n\n营养需求特点：\n1. 能量需求降低，但蛋白质需求不变甚至增加\n2. 钙需求增加：每天1000-1200mg\n3. 维生素D需求增加：每天800-1000IU\n4. 维生素B12吸收能力下降\n5. 铁需求相对减少\n\n饮食原则：\n1. 食物细软，少食多餐\n2. 保证优质蛋白：鱼、禽、蛋、奶、豆\n3. 多吃深色蔬菜和水果\n4. 适量坚果，补充不饱和脂肪酸\n5. 足量饮水，每天1500-1700ml\n6. 限制盐摄入，每天不超过5g\n\n常见问题：\n- 食欲下降：增加食物色香味，少食多餐\n- 便秘：增加膳食纤维和水分摄入\n- 骨质疏松：补钙和维生素D，适量运动\n- 肌少症：增加蛋白质摄入，坚持抗阻运动',
      summary: '老年人营养需求特点与饮食指导原则', tags: '老年人,营养,饮食指导', author: '老年科', views: 1423
    },
    {
      title: '高血压患者的饮食管理', category: '慢病管理',
      content: '高血压是最常见的慢性病之一，饮食管理是治疗的基础：\n\nDASH饮食原则：\n1. 减少钠盐：每天不超过5g\n2. 增加钾摄入：多吃蔬菜水果\n3. 限制饱和脂肪：选择低脂乳制品\n4. 增加膳食纤维：全谷物、豆类\n5. 适量坚果：每天一小把\n\n推荐食物：\n- 芹菜、菠菜、香蕉（富含钾）\n- 燕麦、糙米（富含膳食纤维）\n- 深海鱼（富含不饱和脂肪酸）\n- 低脂牛奶（富含钙）\n\n避免食物：\n- 腌制食品（高盐）\n- 加工肉类（高盐高脂）\n- 酒精\n- 高糖饮料\n\n生活方式：\n- 规律运动\n- 控制体重\n- 戒烟限酒\n- 心理平衡\n- 定期监测血压',
      summary: '高血压患者DASH饮食原则与生活方式管理', tags: '高血压,慢病,饮食管理', author: '心内科', views: 1987
    },
    {
      title: '糖尿病饮食治疗指南', category: '慢病管理',
      content: '糖尿病饮食治疗是控制血糖的基础：\n\n基本原则：\n1. 控制总热量，维持健康体重\n2. 均衡营养，合理搭配\n3. 定时定量，少食多餐\n4. 高纤维饮食\n5. 限制精制糖摄入\n\n食物交换份法：\n将食物分为谷薯、蔬果、肉蛋、豆乳、油脂五大类，同类食物可等值交换。\n\n血糖生成指数（GI）：\n- 低GI食物（GI<55）：燕麦、全麦面包、豆类\n- 中GI食物（55≤GI<70）：米饭、面条\n- 高GI食物（GI≥70）：白面包、西瓜\n\n推荐选择低GI食物，搭配高GI食物时加入膳食纤维和蛋白质。\n\n饮食注意事项：\n- 主食定量，粗细搭配\n- 蔬菜每天500g以上\n- 水果在两餐之间吃\n- 优质蛋白适量\n- 烹调方式以蒸煮炖拌为主',
      summary: '糖尿病饮食治疗原则与食物选择指南', tags: '糖尿病,饮食治疗,血糖管理', author: '内分泌科', views: 2105
    },
    {
      title: '运动与营养的黄金搭配', category: '运动营养',
      content: '运动前后的营养补充对运动效果至关重要：\n\n运动前（1-2小时）：\n- 以碳水化合物为主，提供能量\n- 适量蛋白质\n- 避免高脂肪高纤维食物\n- 充分补水\n推荐：全麦面包+鸡蛋、燕麦粥、香蕉\n\n运动中：\n- 持续运动超过1小时需补充碳水\n- 少量多次饮水\n- 可饮用运动饮料补充电解质\n\n运动后（30分钟内）：\n- 补充蛋白质促进肌肉修复\n- 补充碳水化合物恢复糖原\n- 碳水:蛋白质 = 3:1\n推荐：牛奶+香蕉、鸡胸肉+米饭、蛋白粉+水果\n\n不同运动类型的营养策略：\n1. 有氧运动：注重碳水化合物补充\n2. 力量训练：增加蛋白质摄入\n3. 长时间运动：注意电解质和能量补充\n4. 高强度间歇训练：运动后及时补充碳水和蛋白质',
      summary: '运动前后营养补充策略，不同运动类型的营养搭配', tags: '运动营养,健身,饮食搭配', author: '运动医学科', views: 1678
    },
    {
      title: '膳食纤维的健康益处', category: '营养素',
      content: '膳食纤维被称为"第七大营养素"，对健康有多重益处：\n\n分类：\n1. 可溶性纤维：果胶、树胶等，存在于水果、燕麦、豆类中\n2. 不可溶性纤维：纤维素、木质素等，存在于全谷物、蔬菜中\n\n健康益处：\n1. 促进肠道蠕动，预防便秘\n2. 降低胆固醇，预防心血管疾病\n3. 控制血糖，预防糖尿病\n4. 增加饱腹感，有助体重管理\n5. 促进肠道有益菌生长\n6. 降低结直肠癌风险\n\n推荐摄入量：\n成年人每天25-30g\n\n高纤维食物：\n- 燕麦（10.3g/100g）\n- 红豆（7.7g/100g）\n- 西兰花（1.6g/100g）\n- 苹果（1.2g/100g）\n- 黑木耳（29.9g/100g干品）\n\n注意事项：\n- 逐渐增加摄入量\n- 同时增加饮水量\n- 过量可能导致腹胀',
      summary: '膳食纤维的分类、健康益处与食物来源', tags: '膳食纤维,营养素,肠道健康', author: '营养科', views: 1345
    },
    {
      title: '维生素D缺乏的预防与补充', category: '营养素',
      content: '维生素D缺乏是全球性公共卫生问题：\n\n维生素D的作用：\n1. 促进钙磷吸收，维持骨骼健康\n2. 调节免疫功能\n3. 降低慢性病风险\n4. 维持肌肉功能\n\n缺乏原因：\n1. 日照不足\n2. 食物来源有限\n3. 吸收障碍\n4. 老年人合成能力下降\n\n缺乏表现：\n- 儿童佝偻病\n- 成人骨软化症\n- 骨质疏松\n- 肌肉无力\n- 免疫力下降\n\n推荐摄入量：\n- 成年人：每天400-800IU\n- 老年人：每天800-1000IU\n- 孕妇：每天600-800IU\n\n食物来源：\n- 深海鱼（三文鱼、沙丁鱼）\n- 蛋黄\n- 强化牛奶\n- 蘑菇（日晒后）\n\n获取方式：\n1. 适当日晒：每天15-20分钟\n2. 食物补充\n3. 必要时服用补充剂',
      summary: '维生素D缺乏的原因、表现与补充方法', tags: '维生素D,骨骼健康,营养补充', author: '营养科', views: 1567
    },
    {
      title: '科学减重的饮食策略', category: '体重管理',
      content: '科学减重需要合理控制饮食，而非极端节食：\n\n基本原则：\n1. 能量缺口：每天减少300-500kcal\n2. 减重速度：每周0.5-1kg\n3. 营养均衡：不偏食不节食\n4. 长期坚持：养成健康饮食习惯\n\n饮食策略：\n1. 增加蛋白质摄入：每天1.2-1.6g/kg体重\n   - 增加饱腹感\n   - 保护肌肉\n   - 提高食物热效应\n\n2. 选择低GI食物：\n   - 稳定血糖\n   - 减少饥饿感\n   - 减少脂肪堆积\n\n3. 增加膳食纤维：\n   - 增加饱腹感\n   - 减少能量吸收\n\n4. 控制进食速度：\n   - 每餐20分钟以上\n   - 细嚼慢咽\n\n5. 合理安排三餐：\n   - 早餐吃好\n   - 午餐吃饱\n   - 晚餐吃少\n\n避免误区：\n- 不吃主食\n- 只吃水果\n- 极低热量饮食\n- 减肥药依赖',
      summary: '科学减重的饮食策略与常见误区', tags: '减重,饮食策略,体重管理', author: '营养科', views: 2890
    },
    {
      title: '心血管疾病的营养预防', category: '慢病管理',
      content: '心血管疾病是威胁健康的头号杀手，营养预防至关重要：\n\n危险因素：\n1. 高血压\n2. 高血脂\n3. 糖尿病\n4. 肥胖\n5. 吸烟\n6. 缺乏运动\n\n保护性营养素：\n1. Omega-3脂肪酸：降低甘油三酯，抗炎\n   来源：深海鱼、亚麻籽、核桃\n2. 膳食纤维：降低胆固醇\n   来源：全谷物、豆类、蔬果\n3. 抗氧化物质：保护血管内皮\n   来源：深色蔬果、茶\n4. 钾：降低血压\n   来源：香蕉、土豆、菠菜\n5. 叶酸：降低同型半胱氨酸\n   来源：绿叶蔬菜、豆类\n\n饮食建议：\n1. 地中海饮食模式\n2. 每周至少2次深海鱼\n3. 每天一把坚果\n4. 限制红肉和加工肉\n5. 选择植物油\n6. 多吃全谷物\n7. 限制盐和糖',
      summary: '心血管疾病的营养预防策略与保护性营养素', tags: '心血管,慢病预防,营养', author: '心内科', views: 1789
    },
    {
      title: '儿童青少年营养需求', category: '特殊人群',
      content: '儿童青少年处于生长发育关键期，营养需求特殊：\n\n各年龄段能量需求：\n- 4-6岁：1300-1600kcal/天\n- 7-10岁：1600-1800kcal/天\n- 11-13岁：1800-2200kcal/天\n- 14-17岁：2000-2600kcal/天\n\n关键营养素：\n1. 蛋白质：生长发育的基础\n   - 每天每kg体重1.0-1.2g\n   - 优质蛋白占50%以上\n\n2. 钙：骨骼发育\n   - 每天800-1200mg\n   - 牛奶是最好的来源\n\n3. 铁：预防贫血\n   - 青春期女孩尤其注意\n   - 动物肝脏、红肉\n\n4. 锌：促进生长和免疫\n   - 海产品、坚果\n\n5. 维生素A：视力和免疫\n   - 动物肝脏、深色蔬菜\n\n饮食建议：\n1. 三餐规律，早餐必须吃\n2. 食物多样化\n3. 保证奶制品摄入\n4. 限制含糖饮料和零食\n5. 培养良好饮食习惯',
      summary: '儿童青少年各年龄段营养需求与饮食建议', tags: '儿童,青少年,营养需求', author: '儿科', views: 1234
    },
    {
      title: '骨质疏松的营养防治', category: '慢病管理',
      content: '骨质疏松是中老年人常见疾病，营养防治是关键：\n\n危险因素：\n1. 钙摄入不足\n2. 维生素D缺乏\n3. 蛋白质摄入不足\n4. 高盐饮食\n5. 过量咖啡因\n6. 缺乏运动\n\n营养防治策略：\n1. 补钙：\n   - 成年人每天800mg\n   - 50岁以上每天1000-1200mg\n   - 食物来源：牛奶、豆制品、深色蔬菜\n\n2. 补维生素D：\n   - 每天晒太阳15-20分钟\n   - 食物补充：深海鱼、蛋黄\n   - 必要时服用补充剂\n\n3. 适量蛋白质：\n   - 每天1.0-1.2g/kg体重\n   - 过多过少都不利\n\n4. 补充维生素K：\n   - 促进钙沉积到骨骼\n   - 来源：深色蔬菜\n\n5. 补充镁：\n   - 协助钙的吸收利用\n   - 来源：坚果、全谷物\n\n避免：\n- 高盐饮食（促进钙流失）\n- 过量咖啡因\n- 过量碳酸饮料\n- 长期使用糖皮质激素',
      summary: '骨质疏松的营养防治策略与关键营养素', tags: '骨质疏松,营养防治,骨骼健康', author: '骨科', views: 1456
    },
    {
      title: '肠道健康与益生菌', category: '消化健康',
      content: '肠道被称为"第二大脑"，肠道健康与全身健康密切相关：\n\n肠道菌群的作用：\n1. 消化吸收营养\n2. 合成维生素（B族、K）\n3. 调节免疫\n4. 影响情绪\n5. 维持肠道屏障\n\n益生菌与益生元：\n益生菌：活的微生物，适量摄入有益健康\n   - 乳酸菌\n   - 双歧杆菌\n   - 酪酸菌\n\n益生元：益生菌的食物\n   - 膳食纤维\n   - 低聚果糖\n   - 菊粉\n\n促进肠道健康的食物：\n1. 发酵食品：酸奶、泡菜、纳豆\n2. 高纤维食物：全谷物、蔬菜、水果\n3. 多酚类食物：茶、深色水果\n\n损害肠道健康的因素：\n1. 高糖高脂饮食\n2. 滥用抗生素\n3. 长期压力\n4. 缺乏运动\n5. 睡眠不足\n\n改善建议：\n1. 饮食多样化\n2. 每天摄入发酵食品\n3. 保证膳食纤维\n4. 充足饮水\n5. 规律运动\n6. 管理压力',
      summary: '肠道菌群的作用与益生菌益生元的健康益处', tags: '肠道健康,益生菌,消化', author: '消化科', views: 1678
    },
    {
      title: '上班族健康饮食指南', category: '生活方式',
      content: '上班族面临久坐、外卖、加班等健康挑战：\n\n常见问题：\n1. 早餐不吃或随便吃\n2. 午餐外卖高油高盐\n3. 下午茶零食不断\n4. 晚餐过晚过饱\n5. 久坐缺乏运动\n\n改善建议：\n1. 早餐：\n   - 全麦面包+鸡蛋+牛奶\n   - 燕麦粥+水果\n   - 豆浆+包子+蔬菜\n\n2. 午餐：\n   - 自带便当最健康\n   - 外卖选择少油少盐\n   - 荤素搭配，主食适量\n\n3. 下午加餐：\n   - 坚果一小把\n   - 水果一个\n   - 酸奶一杯\n\n4. 晚餐：\n   - 清淡为主\n   - 睡前3小时不进食\n   - 避免高脂高糖\n\n办公室运动：\n1. 每小时起身活动5分钟\n2. 颈部旋转运动\n3. 站立办公\n4. 午休散步\n5. 爬楼梯代替电梯\n\n饮水建议：\n- 每天1500-1700ml\n- 少量多次\n- 放一个水杯在桌面提醒自己',
      summary: '上班族饮食改善建议与办公室健康策略', tags: '上班族,健康饮食,生活方式', author: '营养科', views: 2134
    },
    {
      title: '食物过敏与不耐受', category: '食品安全',
      content: '食物过敏和不耐受是常见的食物不良反应：\n\n食物过敏：\n免疫系统对食物蛋白的异常反应\n\n常见过敏原（八大类）：\n1. 牛奶\n2. 鸡蛋\n3. 花生\n4. 坚果\n5. 鱼类\n6. 甲壳类\n7. 大豆\n8. 小麦\n\n症状：\n- 皮肤：荨麻疹、湿疹\n- 消化：恶心、呕吐、腹泻\n- 呼吸：哮喘、鼻炎\n- 全身：过敏性休克\n\n食物不耐受：\n非免疫介导的不良反应\n\n常见类型：\n1. 乳糖不耐受：缺乏乳糖酶\n   - 喝牛奶后腹胀腹泻\n   - 可选择酸奶或无乳糖牛奶\n\n2. 果糖不耐受：\n   - 水果和蜂蜜后不适\n\n3. 组胺不耐受：\n   - 发酵食品、红酒后头痛\n\n管理策略：\n1. 记录饮食日记\n2. 排除饮食法\n3. 过敏原检测\n4. 避免过敏原\n5. 学会看食品标签\n6. 随身携带急救药物',
      summary: '食物过敏与不耐受的区别、常见类型与管理策略', tags: '食物过敏,不耐受,食品安全', author: '过敏科', views: 1123
    },
    {
      title: '中医食疗养生智慧', category: '中医养生',
      content: '中医食疗是中华传统养生文化的重要组成部分：\n\n基本理论：\n1. 药食同源：食物和药物一样有寒热温凉\n2. 四气五味：\n   - 四气：寒、凉、温、热\n   - 五味：酸、苦、甘、辛、咸\n3. 辨证施食：根据体质选择食物\n\n常见体质与食疗：\n1. 气虚质：\n   - 表现：乏力、气短、易感冒\n   - 食疗：黄芪炖鸡、山药粥\n\n2. 阳虚质：\n   - 表现：怕冷、手脚凉\n   - 食疗：羊肉汤、姜枣茶\n\n3. 阴虚质：\n   - 表现：口干、手足心热\n   - 食疗：银耳羹、百合粥\n\n4. 痰湿质：\n   - 表现：体胖、痰多、困倦\n   - 食疗：薏米粥、陈皮茶\n\n5. 湿热质：\n   - 表现：面垢油光、口苦\n   - 食疗：绿豆汤、冬瓜汤\n\n四季食疗：\n- 春：养肝，多吃绿色蔬菜\n- 夏：养心，清热解暑\n- 秋：养肺，滋阴润燥\n- 冬：养肾，温补为主',
      summary: '中医食疗基本理论与体质食疗方案', tags: '中医,食疗,养生', author: '中医科', views: 2567
    },
    {
      title: '运动损伤的预防与营养恢复', category: '运动营养',
      content: '运动损伤是运动爱好者常遇到的问题：\n\n常见运动损伤：\n1. 肌肉拉伤\n2. 韧带扭伤\n3. 跟腱炎\n4. 膝关节损伤\n5. 网球肘\n\n预防措施：\n1. 充分热身：5-10分钟\n2. 逐步增加运动量\n3. 正确的运动姿势\n4. 合适的运动装备\n5. 避免过度训练\n\n损伤后的营养恢复：\n1. 急性期（0-72小时）：\n   - 增加维生素C：促进胶原合成\n   - 增加蛋白质：修复组织\n   - 补充锌：促进伤口愈合\n   - Omega-3：减轻炎症\n\n2. 修复期：\n   - 增加蛋白质：每天1.5-2.0g/kg\n   - 补充钙和维生素D：骨骼修复\n   - 补充铁：促进造血\n   - 充足碳水化合物：提供能量\n\n3. 功能恢复期：\n   - 均衡营养\n   - 逐步恢复训练\n   - 注意补充水分\n\nRICE原则：\nRest（休息）、Ice（冰敷）、Compression（加压）、Elevation（抬高）',
      summary: '运动损伤的预防措施与营养恢复策略', tags: '运动损伤,营养恢复,运动医学', author: '运动医学科', views: 1345
    },
    {
      title: '饮水与健康', category: '营养基础',
      content: '水是生命之源，合理饮水对健康至关重要：\n\n水的生理功能：\n1. 参与新陈代谢\n2. 运输营养和废物\n3. 调节体温\n4. 润滑关节\n5. 维持细胞形态\n\n推荐饮水量：\n- 成年人：每天1500-1700ml（不含食物中水分）\n- 运动时：额外补充500-1000ml\n- 高温环境：适当增加\n\n饮水时间：\n1. 早晨起床：一杯温水\n2. 上午10点：补充水分\n3. 午餐前：少量饮水\n4. 下午3点：补充水分\n5. 晚餐前：少量饮水\n6. 睡前1小时：少量饮水\n\n饮水注意事项：\n1. 不要等渴了再喝\n2. 少量多次\n3. 避免一次性大量饮水\n4. 白开水是最佳选择\n5. 少喝含糖饮料\n6. 运动前后注意补水\n\n水质选择：\n- 白开水：最经济健康\n- 矿泉水：补充矿物质\n- 纯净水：可饮用但不宜长期单一饮用\n- 避免长期饮用碳酸饮料',
      summary: '水的生理功能与科学饮水方法', tags: '饮水,健康,生活习惯', author: '营养科', views: 1890
    },
    {
      title: '代谢综合征的综合管理', category: '慢病管理',
      content: '代谢综合征是一组代谢异常的集合，增加心血管疾病和糖尿病风险：\n\n诊断标准（具备3项及以上）：\n1. 腹型肥胖：腰围男≥90cm，女≥85cm\n2. 高甘油三酯：≥1.7mmol/L\n3. 低HDL-C：男<1.0，女<1.3mmol/L\n4. 高血压：≥130/85mmHg\n5. 高空腹血糖：≥5.6mmol/L\n\n综合管理策略：\n1. 体重管理：\n   - 目标减重5-10%\n   - 腰围达标\n\n2. 饮食调整：\n   - 限制精制碳水化合物\n   - 增加膳食纤维\n   - 选择健康脂肪\n   - 限制果糖摄入\n   - 控制总热量\n\n3. 运动处方：\n   - 每周150分钟中等强度有氧运动\n   - 每周2-3次抗阻训练\n   - 减少久坐时间\n\n4. 生活方式：\n   - 戒烟限酒\n   - 保证睡眠\n   - 管理压力\n\n5. 定期监测：\n   - 血压\n   - 血糖\n   - 血脂\n   - 腰围',
      summary: '代谢综合征的诊断标准与综合管理策略', tags: '代谢综合征,慢病管理,综合管理', author: '内分泌科', views: 1567
    },
  ]

  const insertArticlesTx = db.transaction(() => {
    for (const article of articles) {
      insertArticle.run(article)
    }
  })
  insertArticlesTx()

  const adminPassword = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@nutrihealth.com', adminPassword, 'admin')
  db.prepare('INSERT OR IGNORE INTO user_profiles (user_id, name, gender, age, height, weight) VALUES (?, ?, ?, ?, ?, ?)').run(1, '管理员', 'male', 30, 175, 70)

  console.log('初始数据插入完成')
}

export default db
