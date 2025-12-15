# React + TypeScript + Vite

Đây là một dự án React hiện đại được xây dựng với Vite, TypeScript, và các công cụ phát triển tốt nhất.

## Cài đặt

Đảm bảo rằng bạn đã cài đặt Node.js phiên bản 14.0 trở lên.

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ mở tại `http://localhost:5173`

## Các Lệnh Khả Dụng

- `npm run dev` - Khởi động development server
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Xem trước production build
- `npm run lint` - Chạy ESLint để kiểm tra code

## Cấu Trúc Thư Mục

```
src/
  ├── App.tsx          # Component chính
  ├── App.css          # Styles cho App
  ├── main.tsx         # Entry point
  ├── index.css        # Global styles
  └── vite-env.d.ts    # TypeScript definitions
public/               # Static assets
dist/                 # Production build output
index.html            # HTML entry point
package.json          # Project dependencies
tsconfig.json         # TypeScript configuration
vite.config.ts        # Vite configuration
```

## Công Nghệ Sử Dụng

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation build tool
- **ESLint** - Code linting
- **React Refresh** - Hot Module Replacement

## Tiếp Theo

1. Mở file `src/App.tsx` để bắt đầu chỉnh sửa
2. Các thay đổi sẽ được hot reload tự động
3. Xem [Vite documentation](https://vitejs.dev) để tìm hiểu thêm

---

**Note:** Hãy cài đặt [Node.js](https://nodejs.org/) nếu chưa có trước khi chạy các lệnh trên.
