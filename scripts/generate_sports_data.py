import json
import random
from pathlib import Path

def generate_chinese_names(count):
    """生成中文姓名"""
    surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗']
    given_names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '梅', '波', '辉', '刚', '健', '雪', '斌', '静', '淑珍', '敏', '丽', '辉', '建华', '磊', '秀兰', '洋', '勇', '艳', '杰']
    
    names = []
    for _ in range(count):
        surname = random.choice(surnames)
        given_name = ''.join(random.choices(given_names, k=random.randint(1, 2)))
        names.append(surname + given_name)
    
    return names

def generate_sports_events():
    """生成运动会项目"""
    track_events = {
        '男子组': ['100米', '200米', '400米', '800米', '1500米', '3000米', '4×100米接力', '4×400米接力', '110米栏'],
        '女子组': ['100米', '200米', '400米', '800米', '1500米', '4×100米接力', '4×400米接力', '100米栏']
    }
    
    field_events = {
        '男子组': ['跳高', '跳远', '三级跳远', '铅球', '铁饼', '标枪'],
        '女子组': ['跳高', '跳远', '三级跳远', '铅球', '铁饼', '标枪']
    }
    
    return track_events, field_events

def generate_schedule():
    """生成比赛日程"""
    schedule = {
        "第一天": {
            "上午": [
                ("09:30", "12:00"),
                ["100米预赛", "200米预赛", "400米预赛", "800米预赛", "跳高", "跳远", "铅球"]
            ],
            "下午": [
                ("14:30", "17:30"),
                ["100米决赛", "200米决赛", "400米决赛", "1500米预决赛", "三级跳远", "铁饼"]
            ]
        },
        "第二天": {
            "上午": [
                ("09:30", "12:00"),
                ["110米栏预赛", "100米栏预赛", "4×100米接力预赛", "标枪", "跳高决赛"]
            ],
            "下午": [
                ("14:30", "17:30"),
                ["110米栏决赛", "100米栏决赛", "4×100米接力决赛", "4×400米接力", "3000米"]
            ]
        }
    }
    return schedule

def generate_students():
    """生成学生名单"""
    grades = ['高一', '高二', '高三']
    classes_per_grade = 16  # 每个年级16个班
    students_per_class = 50  # 每班50人
    
    students = {}
    student_id = 1
    
    for grade in grades:
        for class_num in range(1, classes_per_grade + 1):
            class_name = f"{grade}{class_num}班"
            class_students = []
            
            # 生成男生（约25人）
            male_names = generate_chinese_names(25)
            for name in male_names:
                class_students.append({
                    'id': student_id,
                    'name': name,
                    'gender': '男',
                    'class': class_name,
                    'grade': grade
                })
                student_id += 1
            
            # 生成女生（约25人）
            female_names = generate_chinese_names(25)
            for name in female_names:
                class_students.append({
                    'id': student_id,
                    'name': name,
                    'gender': '女',
                    'class': class_name,
                    'grade': grade
                })
                student_id += 1
            
            students[class_name] = class_students
    
    return students

def generate_games_schedule():
    """生成比赛项目安排"""
    games = {
        "第一天": [
            # 上午比赛
            [
                {"grade": "高一", "name": "高一男子组-100米-预赛", "time": "09:30"},
                {"grade": "高一", "name": "高一女子组-100米-预赛", "time": "09:42"},
                {"grade": "高二", "name": "高二男子组-100米-预赛", "time": "09:50"},
                {"grade": "高二", "name": "高二女子组-100米-预赛", "time": "09:58"},
                {"grade": "高三", "name": "高三男子组-100米-预赛", "time": "10:04"},
                {"grade": "高三", "name": "高三女子组-100米-预赛", "time": "10:10"},
                {"grade": "高一", "name": "高一男子组-400米-预决赛", "time": "10:14"},
                {"grade": "高一", "name": "高一女子组-400米-预决赛", "time": "10:34"},
                {"grade": "高二", "name": "高二男子组-400米-预决赛", "time": "10:42"},
                {"grade": "高二", "name": "高二女子组-400米-预决赛", "time": "10:50"},
                {"grade": "高三", "name": "高三男子组-400米-预决赛", "time": "10:54"},
                {"grade": "高三", "name": "高三女子组-400米-预决赛", "time": "11:06"}
            ],
            # 下午比赛
            [
                {"grade": "高一", "name": "高一男子组-100米-决赛", "time": "14:30"},
                {"grade": "高一", "name": "高一女子组-100米-决赛", "time": "14:32"},
                {"grade": "高二", "name": "高二男子组-100米-决赛", "time": "14:34"},
                {"grade": "高二", "name": "高二女子组-100米-决赛", "time": "14:36"},
                {"grade": "高三", "name": "高三男子组-100米-决赛", "time": "14:38"},
                {"grade": "高三", "name": "高三女子组-100米-决赛", "time": "14:40"},
                {"grade": "高一", "name": "高一男子组-1500米-预决赛", "time": "14:42"},
                {"grade": "高一", "name": "高一女子组-1500米-预决赛", "time": "14:51"},
                {"grade": "高二", "name": "高二男子组-1500米-预决赛", "time": "15:00"},
                {"grade": "高二", "name": "高二女子组-1500米-预决赛", "time": "15:09"},
                {"grade": "高三", "name": "高三男子组-1500米-预决赛", "time": "15:18"},
                {"grade": "高三", "name": "高三女子组-1500米-预决赛", "time": "15:27"}
            ],
            # 田赛上午
            [
                {"grade": "高一", "name": "高一男子组-跳高-预决赛", "time": "09:30"},
                {"grade": "高三", "name": "高三女子组-跳远-预决赛", "time": "09:30"},
                {"grade": "高二", "name": "高二男子组-三级跳远-预决赛", "time": "10:00"},
                {"grade": "高三", "name": "高三男子组-三级跳远-预决赛", "time": "10:30"},
                {"grade": "高一", "name": "高一女子组-铅球-预决赛", "time": "09:30"}
            ],
            # 田赛下午
            [
                {"grade": "高二", "name": "高二男子组-跳高-预决赛", "time": "14:30"},
                {"grade": "高二", "name": "高二女子组-跳高-预决赛", "time": "15:20"},
                {"grade": "高二", "name": "高二女子组-铅球-预决赛", "time": "14:30"},
                {"grade": "高三", "name": "高三男子组-铅球-预决赛", "time": "15:20"},
                {"grade": "高一", "name": "高一男子组-跳远-预决赛", "time": "14:30"},
                {"grade": "高一", "name": "高一女子组-跳远-预决赛", "time": "15:10"},
                {"grade": "高三", "name": "高三女子组-三级跳远-预决赛", "time": "15:40"},
                {"grade": "高二", "name": "高二女子组-三级跳远-预决赛", "time": "16:10"}
            ]
        ],
        "第二天": [
            # 上午比赛
            [
                {"grade": "高一", "name": "高一男子组-200米-预赛", "time": "09:30"},
                {"grade": "高一", "name": "高一女子组-200米-预赛", "time": "09:42"},
                {"grade": "高二", "name": "高二男子组-200米-预赛", "time": "09:50"},
                {"grade": "高二", "name": "高二女子组-200米-预赛", "time": "09:58"},
                {"grade": "高三", "name": "高三男子组-200米-预赛", "time": "10:04"},
                {"grade": "高三", "name": "高三女子组-200米-预赛", "time": "10:10"},
                {"grade": "高一", "name": "高一男子组-800米-预决赛", "time": "10:14"},
                {"grade": "高一", "name": "高一女子组-800米-预决赛", "time": "10:34"},
                {"grade": "高二", "name": "高二男子组-800米-预决赛", "time": "10:42"},
                {"grade": "高二", "name": "高二女子组-800米-预决赛", "time": "10:50"},
                {"grade": "高三", "name": "高三男子组-800米-预决赛", "time": "10:54"},
                {"grade": "高三", "name": "高三女子组-800米-预决赛", "time": "11:06"}
            ],
            # 下午比赛
            [
                {"grade": "高一", "name": "高一男子组-200米-决赛", "time": "14:30"},
                {"grade": "高一", "name": "高一女子组-200米-决赛", "time": "14:32"},
                {"grade": "高二", "name": "高二男子组-200米-决赛", "time": "14:34"},
                {"grade": "高二", "name": "高二女子组-200米-决赛", "time": "14:36"},
                {"grade": "高三", "name": "高三男子组-200米-决赛", "time": "14:38"},
                {"grade": "高三", "name": "高三女子组-200米-决赛", "time": "14:40"},
                {"grade": "高一", "name": "高一男子组-4×100米接力-预决赛", "time": "14:42"},
                {"grade": "高一", "name": "高一女子组-4×100米接力-预决赛", "time": "14:50"},
                {"grade": "高二", "name": "高二男子组-4×100米接力-预决赛", "time": "14:58"},
                {"grade": "高二", "name": "高二女子组-4×100米接力-预决赛", "time": "15:06"},
                {"grade": "高三", "name": "高三男子组-4×100米接力-预决赛", "time": "15:14"},
                {"grade": "高三", "name": "高三女子组-4×100米接力-预决赛", "time": "15:22"}
            ],
            # 田赛上午
            [
                {"grade": "高一", "name": "高一男子组-铁饼-预决赛", "time": "09:30"},
                {"grade": "高三", "name": "高三女子组-铁饼-预决赛", "time": "09:30"},
                {"grade": "高二", "name": "高二男子组-标枪-预决赛", "time": "10:00"},
                {"grade": "高三", "name": "高三男子组-标枪-预决赛", "time": "10:30"},
                {"grade": "高一", "name": "高一女子组-标枪-预决赛", "time": "09:30"}
            ],
            # 田赛下午
            [
                {"grade": "高二", "name": "高二男子组-铁饼-预决赛", "time": "14:30"},
                {"grade": "高二", "name": "高二女子组-铁饼-预决赛", "time": "15:20"},
                {"grade": "高二", "name": "高二女子组-标枪-预决赛", "time": "14:30"},
                {"grade": "高三", "name": "高三男子组-标枪-预决赛", "time": "15:20"},
                {"grade": "高一", "name": "高一男子组-110米栏-预决赛", "time": "14:30"},
                {"grade": "高一", "name": "高一女子组-100米栏-预决赛", "time": "15:10"},
                {"grade": "高三", "name": "高三男子组-110米栏-预决赛", "time": "15:40"},
                {"grade": "高二", "name": "高二女子组-100米栏-预决赛", "time": "16:10"}
            ]
        ]
    }
    return games

def generate_players_for_events(students, games):
    """为每个比赛项目生成参赛选手"""
    players = {}
    
    # 获取所有比赛项目名称
    all_events = []
    for day, sessions in games.items():
        for session in sessions:
            for event in session:
                all_events.append(event['name'])
    
    print(f"找到 {len(all_events)} 个比赛项目")
    
    # 为每个项目随机分配选手
    for event_name in all_events:
        # 解析项目名称获取年级和性别信息
        grade = None
        gender = None
        
        # 更精确的年级匹配
        if '高一' in event_name:
            grade = '高一'
        elif '高二' in event_name:
            grade = '高二'
        elif '高三' in event_name:
            grade = '高三'
        
        # 更精确的性别匹配
        if '男子组' in event_name:
            gender = '男'
        elif '女子组' in event_name:
            gender = '女'
        
        print(f"解析项目 {event_name}: 年级={grade}, 性别={gender}")
        if grade and gender:
            print(f"处理项目 {event_name}: 年级={grade}, 性别={gender}")
            # 为该项目的每个组别（通常有多个组别）分配选手
            event_players = []
            
            for group_num in range(1, 6):  # 5个组别
                group_players = []
                
                # 每个组别6名选手
                for road_num in range(1, 7):
                    # 从对应年级和性别的学生中随机选择
                    eligible_students = []
                    for class_name, class_students in students.items():
                        if class_name.startswith(grade):
                            for student in class_students:
                                if student['gender'] == gender:
                                    eligible_students.append(student)
                    
                    if eligible_students:
                        selected_student = random.choice(eligible_students)
                        group_players.append({
                            "road": str(road_num),
                            "name": selected_student['name'],
                            "data": "-",
                            "class": selected_student['class']
                        })
                    else:
                        # 如果没有合适的学生，生成一个随机姓名
                        name = generate_chinese_names(1)[0]
                        group_players.append({
                            "road": str(road_num),
                            "name": name,
                            "data": "-",
                            "class": f"{grade}{random.randint(1, 16)}班"
                        })
                
                event_players.append(group_players)
            
            players[event_name] = {
                "name": event_name,
                "players": event_players
            }
    
    return players

def main():
    """主函数：生成完整的运动会数据"""
    print("正在生成运动会数据...")
    
    # 1. 生成学生名单
    print("1. 生成学生名单...")
    students = generate_students()
    
    # 2. 生成比赛日程
    print("2. 生成比赛日程...")
    games = generate_games_schedule()
    
    # 3. 为每个项目生成参赛选手
    print("3. 生成参赛选手...")
    # 调试：显示学生数据结构
    print(f"学生数据结构示例: {list(students.keys())[:3]}")
    sample_class = list(students.values())[0]
    print(f"班级学生示例: {sample_class[:2] if sample_class else '无'}")
    players = generate_players_for_events(students, games)
    
    # 5. 组合成完整数据
    sports_data = {
        "games": games,
        "players": players
    }
    
    print(f"生成了 {len(players)} 个比赛项目的选手数据")
    
    # 5. 保存到文件
    output_path = Path("f:/Code/2025SportsMeetingWeb/public/data/sports_data_new.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sports_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n数据生成完成！")
    print(f"- 学生总数: {sum(len(class_students) for class_students in students.values())}")
    print(f"- 班级总数: {len(students)}")
    print(f"- 比赛项目总数: {len(players)}")
    print(f"- 数据文件已保存到: {output_path}")
    
    # 显示一些统计信息
    print(f"\n各年级人数统计:")
    for grade in ['高一', '高二', '高三']:
        grade_students = sum(len([s for s in class_students if s['grade'] == grade]) 
                           for class_students in students.values())
        print(f"- {grade}: {grade_students}人")
    
    print(f"\n部分比赛项目示例:")
    sample_events = list(players.keys())[:5]
    for event in sample_events:
        print(f"- {event}")

if __name__ == "__main__":
    main()