# TapGo Learning Improvements

> updated 2026-09-22 · implementation pass 1

## Mục tiêu

Cải thiện TapGo để trẻ khoảng 6 tuổi học bàn phím và chuột dễ hơn, ít áp lực hơn và nhận được chỉ dẫn hữu ích sau mỗi lỗi.

## Quyết định triển khai

### 1. Hướng dẫn có thể mở bất cứ lúc nào

Trong `GameShell`, thêm nút `Xem cách chơi`. Hướng dẫn không chặn gameplay để giữ tương thích với luồng hiện tại và giúp trẻ tự chọn lúc cần trợ giúp.

- Game bàn phím: nhìn chữ/số lớn và bấm đúng phím.
- Game chuột: làm theo hình minh họa, thử chậm và không cần vội.

### 2. Feedback sau lỗi phải chỉ dẫn hành động tiếp theo

`onRetry` nhận thêm một hint tùy chọn.

- Game phím: `Hãy tìm phím X trên bàn phím nhé.`
- Game từ: `Hãy tìm chữ X trên màn hình nhé.`
- Fallback chung: `Thử lại nhé, con làm chậm thôi.`

Hint dùng `role="status"` để hỗ trợ screen reader và vẫn nhẹ nhàng với trẻ.

### 3. Ôn lại ngay mục tiêu vừa sai

Sau khi hoàn thành một lượt với lỗi, `GameShell` remount cùng mini-game đó thêm một lần trước khi sang lượt mới. Đây là spaced repetition nhẹ, không tạo màn hình phạt và không dùng timer.

### 4. Trợ giúp thích nghi

Nếu trẻ sai hai lần trong cùng lượt, guide panel tự mở để đưa ra hướng dẫn tổng quát. Hint cụ thể vẫn được cập nhật theo mục tiêu hiện tại.

### 5. Gợi ý luyện tập cho phụ huynh

Màn hình Tiến độ chọn bài đầu tiên chưa hoàn thành; nếu đã hoàn thành hết, chọn bài chưa đạt 3 sao. Gợi ý này giúp buổi học tiếp theo có điểm bắt đầu rõ ràng mà không cần tài khoản hay backend.

### 6. Giữ nguyên nhịp chơi không countdown

Không thêm timer, leaderboard hoặc failure screen. Accuracy vẫn dùng để tính sao, nhưng feedback tập trung vào hành động cần thử tiếp theo.

## Kế hoạch tiếp theo

1. Lặp lại mục tiêu trẻ hay sai qua nhiều session và lưu weak-skill profile.
2. Thêm spaced repetition dài hạn cho các phím/từ hay sai.
3. Thêm adaptive difficulty nhẹ dựa trên lỗi liên tiếp trong nhiều buổi.
4. Bổ sung parent progress chi tiết hơn với kỹ năng đã luyện.
5. Manual QA trên Chrome/Edge với chuột thật, keyboard thật và Speech API.

## Tiêu chí nghiệm thu

- Nút `Xem cách chơi` mở/đóng được trong mọi game.
- Sau thao tác sai, trẻ nhìn thấy lời nhắc cụ thể, không phải thông báo thất bại.
- Không làm thay đổi số lượt, scoring, unlock path hoặc localStorage schema.
- Test suite và production build vẫn pass.

## Thay đổi đã thực hiện

- Mở rộng `MiniGameProps.onRetry` để nhận hint.
- Thêm hint cụ thể cho game gõ phím và gõ từ.
- Thêm guide panel dùng chung trong `GameShell`.
- Thêm style cho guide và retry hint.
- Thêm ôn lại ngay lượt có lỗi bằng `reviewPending` và `reviewCycle`.
- Tự mở hướng dẫn sau hai lần retry trong cùng lượt.
- Thêm gợi ý bài nên luyện ở màn hình Tiến độ.

## Amendments

### 2026-09-22 — Guided Play v1 sau 8 pass akithink

Mục tiêu được nâng từ “app dễ dùng” thành “bé có thể tự bắt đầu, hiểu việc cần làm, hồi phục sau lỗi và đi tiếp với ít quyết định nhất”.

- Home thêm CTA chính `Chơi ngay`; Lộ trình, Chơi tự do và Tiến độ trở thành lựa chọn phụ.
- `Chơi ngay` chọn bài đầu tiên chưa hoàn thành và chạy quick session tối đa 5 lượt.
- `GameShell` đọc intro khi vào bài; từ lỗi thứ hai tự mở guide và đọc hint cụ thể.
- `assistLevel` tăng dần để làm nổi bật mục tiêu, tăng hit area hoặc snap tolerance ở các game chuột.
- Màn hình kết quả ưu tiên thông điệp hoàn thành và CTA `Bài tiếp theo`; sao trở thành tín hiệu phụ.
- Lượt ôn lại được tách khỏi `outcomes` để spaced repetition không làm thay đổi scoring của lượt gốc.
- Thứ tự game dùng `GAME_IDS` làm canonical order; registry và next-game navigation đều dẫn xuất từ nguồn này.

Validation cần ưu tiên manual test với bé: người lớn không chỉ tay hay đọc hộ, quan sát xem bé có tự đi được chuỗi Home → Chơi ngay → hoàn thành → tự hồi phục sau lỗi → Bài tiếp theo hay không.
