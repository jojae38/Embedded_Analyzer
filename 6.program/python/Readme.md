## 사용법
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt

## UI 수정 용도로 사용시
pyside6-uic ard_ui.ui -o mainwindow.py

## 빌드 시 - exe 빌드 파일 생성
python setup.py build

## 파이썬 버전
3.11.7

## 사용하는 파이썬 라이브러리
PySide6