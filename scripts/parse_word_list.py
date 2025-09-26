import os
import sys
from pathlib import Path

def extract_text_from_docx_simple(file_path):
    """简单解析docx文件，提取文本内容"""
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            
        # 查找XML文档内容
        start_marker = b'<w:t>'
        end_marker = b'</w:t>'
        
        text_parts = []
        start_pos = 0
        
        while True:
            start_idx = content.find(start_marker, start_pos)
            if start_idx == -1:
                break
                
            end_idx = content.find(end_marker, start_idx)
            if end_idx == -1:
                break
                
            # 提取文本
            text_start = start_idx + len(start_marker)
            text_content = content[text_start:end_idx].decode('utf-8', errors='ignore')
            text_parts.append(text_content)
            
            start_pos = end_idx
        
        return ''.join(text_parts)
    except Exception as e:
        print(f"解析docx文件时出错: {e}")
        return None

def parse_student_list(text_content):
    """从文本中提取学生名单信息"""
    lines = text_content.split('\n')
    students = []
    current_grade = ""
    current_class = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 检测年级
        if '高一' in line and ('班' in line or '年' in line):
            current_grade = '高一'
            if '班' in line:
                # 提取班级号
                import re
                class_match = re.search(r'(\d+)班', line)
                if class_match:
                    current_class = f"高一{class_match.group(1)}班"
            continue
        elif '高二' in line and ('班' in line or '年' in line):
            current_grade = '高二'
            if '班' in line:
                import re
                class_match = re.search(r'(\d+)班', line)
                if class_match:
                    current_class = f"高二{class_match.group(1)}班"
            continue
        elif '高三' in line and ('班' in line or '年' in line):
            current_grade = '高三'
            if '班' in line:
                import re
                class_match = re.search(r'(\d+)班', line)
                if class_match:
                    current_class = f"高三{class_match.group(1)}班"
            continue
        
        # 检测班级
        if current_grade and '班' in line and len(line) < 10:
            import re
            class_match = re.search(r'(\d+)班', line)
            if class_match:
                current_class = f"{current_grade}{class_match.group(1)}班"
            continue
        
        # 检测学生姓名（假设每个姓名2-4个字符）
        if current_grade and current_class and len(line) >= 2 and len(line) <= 4:
            # 简单的中文姓名检测
            import re
            if re.match(r'^[\u4e00-\u9fa5]{2,4}$', line):
                students.append({
                    'name': line,
                    'grade': current_grade,
                    'class': current_class
                })
    
    return students

def main():
    docx_path = Path("f:/Code/2025SportsMeetingWeb/public/data/人员名单.docx")
    
    if not docx_path.exists():
        print(f"文件不存在: {docx_path}")
        return
    
    print("正在解析Word文档...")
    text_content = extract_text_from_docx_simple(docx_path)
    
    if not text_content:
        print("无法提取文档内容")
        return
    
    print("提取的文本内容（前500字符）:")
    print(text_content[:500])
    print("-" * 50)
    
    students = parse_student_list(text_content)
    
    print(f"\n解析到 {len(students)} 名学生:")
    for student in students[:20]:  # 显示前20名
        print(f"{student['grade']} {student['class']}: {student['name']}")
    
    if len(students) > 20:
        print(f"... 还有 {len(students) - 20} 名学生")
    
    # 保存解析结果
    output_path = Path("f:/Code/2025SportsMeetingWeb/public/data/parsed_students.json")
    import json
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(students, f, ensure_ascii=False, indent=2)
    
    print(f"\n解析结果已保存到: {output_path}")

if __name__ == "__main__":
    main()