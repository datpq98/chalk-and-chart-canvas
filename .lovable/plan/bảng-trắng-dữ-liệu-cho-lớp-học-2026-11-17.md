# Bảng trắng dữ liệu cho lớp học

## Mục tiêu
Xây trang bảng trắng tương tác tại `/`, tập trung vào thao tác giảng dạy: sửa bảng ngay trên canvas, biến bảng thành biểu đồ và quan sát dữ liệu thay đổi tức thời.

## Trải nghiệm
- Không gian lớp học sáng, gọn và giàu tương phản; canvas dạng lưới làm vùng làm việc chính, thanh công cụ rõ ràng và giao diện tiếng Việt.
- Mở đầu bằng một bảng mẫu về kết quả học tập để giáo viên có thể sử dụng ngay.
- Bảng cho phép sửa ô, thêm/xóa hàng, thêm/đổi tên/xóa cột; các thao tác giữ dữ liệu và biểu đồ đồng bộ.
- Kéo thả bảng và biểu đồ trên canvas; nút tạo biểu đồ mở hộp chọn các loại phổ biến (cột, đường, miền, tròn, vành khuyên, phân tán, radar).
- Biểu đồ mới nằm cạnh bảng; chọn cột số liệu và kiểu biểu đồ, và phản ánh thay đổi dữ liệu ngay lập tức.

## Kỹ thuật
- Dùng React state tại trang cho dữ liệu bảng, vị trí widget, cấu hình biểu đồ và loại biểu đồ; không cần dịch vụ lưu trữ cho bản tương tác đầu tiên.
- Dùng Recharts đã có trong dự án; CSS tùy chỉnh đặt trong `src/styles.css` và dùng token ngữ nghĩa.
- Thêm metadata riêng cho trang chủ và kiểm tra luồng chỉnh bảng → tạo biểu đồ → cập nhật biểu đồ.
