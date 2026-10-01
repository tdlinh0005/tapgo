# TapGo Documentation

## Current product and feature specification

- [TapGo MVP](feat/tapgo-mvp.md) — product scope, UX rules, game framework, 12 mini-game definitions, progress model, speech/audio behavior, testing and acceptance criteria.

## Active implementation plans

- [TapGo v3 · Giao diện hấp dẫn trẻ + bài tập phong phú](plan/v3-kid-visual-redesign.md) — 17 task (phase A–E): bố cục vùng chơi, bảng màu/font/mascot, lộ trình dạng đường đi, xáo trộn + mở rộng kho bài tập; đã rà soát với code; V01–V16 xong (game 11–12 đã thêm); V17: docs + đo CDP (12 game vừa 1366×768 / 1280×720, input thật) đã xong, còn QA người chạy trên Chrome/Edge thật (giọng `vi-VN`, quan sát bé chơi), xong thì chuyển plan sang Done plans.
- [Fix plan từ audit sep30](plan/fix-audit-sep30.md) — 47 task fix (8 phase, 0–7; Phase 7 là bug từ QA T44) từ audit toàn repo; chỉ còn T44 (QA thủ công Chrome/Edge thật; lượt 2 qua CDP đã PASS 2026-10-01, còn giọng đọc + người chạy).
- [TapGo v2 · Guided Play Plan](plan/v2-guided-play.md) — toàn bộ việc guided play (đã làm + còn lại), gồm checklist manual QA cho guided và kết quả QA T44.

## Done plans

- [TapGo MVP Implementation Plan](plan/done/tapgo-mvp.md) — task-by-task TDD implementation sequence for the React + Vite MVP; đóng 2026-09-30 theo yêu cầu owner, manual QA (Step 6) chuyển sang T44 / G16.

## Research

- [Audit toàn repo (sep30)](research/audit-full-sep30.md) — kết quả review 3 lane (flow, UI/UX, docs/test/build) trên commit `fa28cb4`.
- [TapGo learning improvements 2 · Guided Play v1](research/tapgo-learning-improvements-2.md) — Chơi ngay, quick session 5 lượt, trợ giúp tăng dần sau lỗi; doc hiện hành của chuỗi.
- [TapGo learning improvements](research/tapgo-learning-improvements.md) — pass 1: retry hint, guide, lượt ôn, gợi ý phụ huynh; superseded bởi doc 2.
