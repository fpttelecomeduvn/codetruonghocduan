# Hướng Dẫn Kết Nối Supabase

## Thông Tin Kết Nối
- **URL**: https://lnthatrbvoumsjpkdbjm.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGhhdHJidm91bXNqcGtkYmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODMxNTUsImV4cCI6MjA4MTM1OTE1NX0.AaB0pDje6cXuSQiCDxG1-BamF7yaDQtojw6kcgx6Dz4
- **Email**: dammeso@gmail.com

## Cách Setup Database

### Bước 1: Truy cập Supabase Dashboard
1. Vào https://supabase.com/dashboard/project/lnthatrbvoumsjpkdbjm
2. Đăng nhập bằng email: dammeso@gmail.com

### Bước 2: Tạo Các Bảng Dữ Liệu
1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy toàn bộ nội dung từ file `database_setup.sql`
3. Dán vào SQL Editor
4. Nhấn "Run" hoặc "Ctrl+Enter" để thực thi

### Bước 3: Xem Dữ Liệu
Sau khi tạo xong, bạn có thể xem các bảng trong **Table Editor**:
- `users` - Danh sách người dùng (Admin, Teacher, Viewer)
- `students` - Danh sách sinh viên
- `teachers` - Danh sách giáo viên
- `classes` - Danh sách lớp học
- `subjects` - Danh sách môn học
- `teacher_evaluations` - Đánh giá giáo viên
- `graduation_evaluations` - Đánh giá tốt nghiệp
- `promotion_results` - Kết quả xét lên lớp

## Cách Chạy Ứng Dụng
1. Đã cài đặt Supabase client: `npm install @supabase/supabase-js`
2. Chạy: `npm run dev`
3. Truy cập: http://localhost:5175

## Ghi Chú
- Tất cả các dữ liệu sẽ được lưu trên Supabase cloud
- Có thể sử dụng Supabase Auth để quản lý người dùng (tuỳ chọn)
- Row Level Security (RLS) có thể được bật để tăng bảo mật
