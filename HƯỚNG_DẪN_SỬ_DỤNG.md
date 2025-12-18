# 📚 Hệ Thống Quản Lý Giáo Dục - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan Hệ Thống

Hệ thống quản lý giáo dục tích hợp toàn bộ quy trình quản lý từ dữ liệu sinh viên cho đến xét lên lớp với logic liên kết chặt chẽ.

### 📊 Các Module Chính

#### 1. **👨‍🎓 Quản Lý Sinh Viên** (Students)
- Thêm, sửa, xem, xóa thông tin sinh viên
- Lưu trữ: ID, tên, email, số điện thoại, ngày sinh, địa chỉ
- Các sinh viên sẽ được liên kết tới các lớp học, môn học và đánh giá

#### 2. **👨‍🏫 Quản Lý Giáo Viên** (Teachers)
- Quản lý danh sách giáo viên
- Lưu trữ: ID, tên, email, số điện thoại, chuyên môn, trình độ
- Giáo viên sẽ được liên kết tới các lớp học và đánh giá

#### 3. **🏫 Quản Lý Lớp Học** (Classes)
- Quản lý các lớp học và thông tin lớp
- Lưu trữ: Mã lớp, tên lớp, năm học, giáo viên chủ nhiệm, số lượng SV
- Dùng để liên kết SV, giáo viên, môn học

#### 4. **📚 Quản Lý Môn Học** (Subjects)
- Quản lý thông tin các môn học
- Lưu trữ: Mã, tên, tín chỉ, giảng viên, phòng, lịch, học kỳ, năm học
- **Tính năng**:
  - 🔍 Tìm kiếm theo mã/tên/giảng viên
  - 📋 Lọc theo học kỳ và năm học
  - 📄 Phân trang (5, 8, 10, 20, 50 môn/trang)
  - 💾 Xuất CSV

#### 5. **⭐ Đánh Giá Giáo Viên** (Teacher Evaluation)
- **Lưu trữ đánh giá từ giáo viên về sinh viên**
- Dữ liệu liên kết:
  - Chọn sinh viên từ danh sách (dropdown)
  - Chọn giáo viên từ danh sách (dropdown)
  - Chọn lớp học từ danh sách (dropdown)
- Điểm đánh giá:
  - **Điểm học tập** (0-100): Mức độ nắm bài
  - **Điểm thái độ** (0-100): Tác phong, kỷ luật
  - **Điểm tham gia** (0-100): Sự tham gia lớp
  - **Nhận xét**: Ghi chú, phản hồi

#### 6. **🎓 Đánh Giá Tốt Nghiệp** (Graduation Evaluation)
- **Lưu trữ đánh giá khả năng tốt nghiệp**
- Dữ liệu liên kết:
  - Chọn sinh viên từ danh sách (dropdown)
- Thông tin đánh giá:
  - **GPA** (0-4.0): Điểm trung bình tích lũy
  - **Tín chỉ hoàn thành / yêu cầu**: Số tín chỉ đã học / cần thiết
  - **Điểm khóa luận** (0-100): Điểm bảo vệ khóa luận
  - **Điểm thi cuối kỳ** (0-100): Điểm thi tốt nghiệp
  - **Trạng thái**: pending, passed, failed
  - **Ghi chú**: Thông tin bổ sung

#### 7. **📊 Xét Lên Lớp** (Promotion Result)
- **Tự động tính toán kết quả xét lên lớp dựa trên 2 đánh giá trên**
- **Điều kiện xét lên lớp (ĐẠT)**:
  - ✓ Điểm đánh giá giáo viên ≥ **60**
  - ✓ Điểm tốt nghiệp TB ≥ **60** (TB của khóa luận + thi cuối)
  - ✓ GPA ≥ **2.0**
  - ✓ Hoàn thành ≥ tín chỉ yêu cầu
- **Hiển thị**:
  - Tất cả điểm chi tiết (GV, GPA, tín chỉ, v.v.)
  - Trạng thái tốt nghiệp
  - **Kết quả**: **ĐẠT** hoặc **KHÔNG ĐẠT**
  - **Lý do chi tiết** của kết quả
  - Thống kê: số lượng đạt, không đạt, tỷ lệ đạt

---

## 🔄 Quy Trình Sử Dụng (Recommended Flow)

### Bước 1️⃣: Nhập Dữ Liệu Cơ Bản
1. **Quản Lý Sinh Viên** → Thêm tất cả sinh viên
2. **Quản Lý Giáo Viên** → Thêm tất cả giáo viên
3. **Quản Lý Lớp Học** → Tạo lớp học, gán giáo viên, SV
4. **Quản Lý Môn Học** → Thêm các môn học, gán giáo viên, lớp

### Bước 2️⃣: Đánh Giá Trong Học Kỳ
1. **Đánh Giá Giáo Viên**:
   - Giáo viên đánh giá từng SV trong lớp
   - Chọn SV → Chọn giáo viên tương ứng → Chọn lớp
   - Nhập 3 loại điểm: học tập, thái độ, tham gia
   - Ghi nhận xét nếu cần

### Bước 3️⃣: Đánh Giá Tốt Nghiệp
1. **Đánh Giá Tốt Nghiệp**:
   - Khi SV sắp tốt nghiệp, nhập đánh giá TN
   - Chọn SV → Nhập GPA, tín chỉ, điểm khóa luận, thi cuối
   - Ghi trạng thái: pending/passed/failed

### Bước 4️⃣: Xem Kết Quả Xét Lên Lớp
1. **Xét Lên Lớp**:
   - **Tự động cập nhật** dựa trên 2 đánh giá trên
   - Xem tỷ lệ đạt/không đạt
   - Xem chi tiết lý do của mỗi SV

---

## 💡 Các Tính Năng Nổi Bật

### 🔗 Tích Hợp Logic (Deep Integration)

**Liên Kết Dữ Liệu**:
- Sinh viên ↔ Giáo viên ↔ Lớp ↔ Môn học
- Dropdown chọn tự động lấy dữ liệu từ hệ thống
- Không cần nhập thủ công, giảm lỗi

**Tính Toán Tự Động**:
- Kết quả xét lên lớp tự động dựa trên công thức
- Cập nhật real-time khi có đánh giá mới
- Lý do chi tiết để hiểu tại sao đạt/không đạt

### 📊 Thống Kê & Báo Cáo
- Số lượng SV xét lên lớp: đạt, không đạt, tỷ lệ
- Bảng chi tiết tất cả thông số
- Dễ xuất dữ liệu để làm báo cáo

### 📝 Hỗ Trợ CRUD (Create, Read, Update, Delete)
- Thêm mới ✅
- Xem chi tiết ✅
- Sửa thông tin ✅
- Xóa (với xác nhận) ✅

### 🎨 Giao Diện Thân Thiện
- Dialog nhập liệu rõ ràng
- Bảng dữ liệu sắp xếp, dễ đọc
- Màu sắc phân biệt: xanh = đạt, đỏ = không đạt
- Responsive, dùng được trên mobile

---

## ⚙️ Công Thức & Tiêu Chí

### Công Thức Xét Lên Lớp

```
KẾT QUẢ = ĐẠT nếu:
  AND (
    Điểm GV >= 60,
    Trung bình tố (TL + Thi) >= 60,
    GPA >= 2.0,
    Tín chỉ >= Yêu cầu
  )

KẾT QUẢ = KHÔNG ĐẠT nếu:
  - Bất kỳ điều kiện nào không đáp ứng
  - Hiển thị lý do cụ thể
```

### Ví Dụ

**SV A - ĐẠT**:
- Điểm GV: 75 (≥60) ✓
- TB khóa luận + thi: (85+90)/2 = 87.5 (≥60) ✓
- GPA: 3.2 (≥2.0) ✓
- Tín chỉ: 120 (≥120) ✓
→ **KẾT QUẢ: ĐẠT**

**SV B - KHÔNG ĐẠT**:
- Điểm GV: 55 (<60) ✗
- TB khóa luận + thi: 72 (≥60) ✓
- GPA: 2.5 (≥2.0) ✓
- Tín chỉ: 118 (<120) ✗
→ **KẾT QUẢ: KHÔNG ĐẠT**
→ **LÝ DO**: Điểm GV thấp (55); Tín chỉ không đủ (118/120)

---

## 🚀 Chạy Ứng Dụng

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Mở trình duyệt vào http://localhost:5175
```

## 🛠️ Stack Công Nghệ

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Custom Hooks** (useStudents, useTeachers, v.v.)
- **CSS3** (Styling)
- **In-memory Storage** (Dữ liệu mẫu)

---

## 📋 Dữ Liệu Mẫu

Hệ thống đã có sẵn dữ liệu mẫu:
- 2 sinh viên mẫu (sv-001, sv-002)
- 2 giáo viên mẫu
- 1 lớp học mẫu
- Các môn học mẫu
- 2 đánh giá GV mẫu
- 2 đánh giá TN mẫu
- Kết quả xét lên lớp tính toán sẵn

→ **Có thể thêm/sửa/xóa hoặc nhập dữ liệu mới của mình**

---

## 🎓 Công Dụng

Hệ thống này phù hợp cho:
- ✅ Nhà trường, khoa quản lý SV tốt nghiệp
- ✅ Giáo viên chủ nhiệm, cố vấn học tập
- ✅ Phòng đào tạo, bộ phận quản lý
- ✅ Hỗ trợ quá trình xét lên lớp, tốt nghiệp

---

**Phiên bản**: v1.0  
**Cập nhật**: 2025-12-16  
**Hỗ trợ**: Liên hệ phòng IT
