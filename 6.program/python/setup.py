# import sys
# import os
# from cx_Freeze import setup, Executable
# import PySide6

# # PySide6 경로 확인
# pyside6_path = os.path.dirname(PySide6.__file__)
# qt_plugins_path = os.path.join(pyside6_path, "plugins")
# qt_translations_path = os.path.join(pyside6_path, "translations")

# # ADD FILES
# include_files = [('logo_icon.ico', 'logo_icon.ico'),
#         ('setting.json', 'setting.json'),
#         ('settings','settings'),
#         ('firmware','firmware'),
#         ('loader','loader'),
#         ('logs','logs'),
#         ('style.qss', 'style.qss'),
#         (qt_plugins_path, "PySide6/plugins"),
#         (qt_translations_path, "PySide6/translations")
#          ]
# qt_debug_path = os.path.join(pyside6_path, "Qt", "bin", "Qt6Widgets.dll")
# if os.path.exists(qt_debug_path):
#     include_files.append((qt_debug_path, "PySide6/Qt/bin/Qt6Widgets.dll"))
# # 빌드 옵션
# build_exe_options = {
#     "includes": [
#         "PySide6.QtWidgets",
#         "PySide6.QtGui",
#         "PySide6.QtCore",
#         "PySide6.QtUiTools"
#     ],
#     "packages": ["PySide6"],
#     "include_files": include_files,
#     "excludes": ["PySide6._cx_freeze_qt_debug"]  # ← 여기 추가
# }

# # 실행 파일 지정
# base = "Win32GUI" if sys.platform == "win32" else None

# executables = [
#     Executable(
#         script="main.py",
#         base="Win32GUI",
#         target_name="stm32_downloader.exe",
#         icon="logo_icon.ico"
#     )
# ]

# # SETUP CX FREEZE
# setup(
#     name="STM32_Downloader",
#     version="1.0",
#     description="STM32 Flash GUI Tool",
#     author="JO",
#     options={"build_exe": build_exe_options},
#     executables=executables
# )

# setup_cxfreeze.py
import sys, os
from cx_Freeze import setup, Executable

def norm(p): return os.path.normpath(p)

# PySide6 경로
# pyside6_path = os.path.dirname(PySide6.__file__)
# qt_plugins_path = norm(os.path.join(pyside6_path, "plugins"))
# qt_translations_path = norm(os.path.join(pyside6_path, "translations"))
# qt_widgets_dll = norm(os.path.join(pyside6_path, "Qt", "bin", "Qt6Widgets.dll"))  # 없을 수도 있음

# 추가 리소스(프로젝트에 실제 존재해야 함)
include_files = [
    ('logo_icon.ico', 'logo_icon.ico'),
    ('setting.json', 'setting.json'),
    ('settings', 'settings'),
    ('firmware', 'firmware'),
    ('loader', 'loader'),
    ('logs', 'logs'),
    ('style.qss', 'style.qss'),
]

# 존재하는 경우에만 추가(없는데 추가하면 빌드 꼬임 방지)
# if os.path.isdir(qt_plugins_path):
#     include_files.append((qt_plugins_path, "PySide6/plugins"))
# if os.path.isdir(qt_translations_path):
#     include_files.append((qt_translations_path, "PySide6/translations"))
# if os.path.isfile(qt_widgets_dll):
#     include_files.append((qt_widgets_dll, "PySide6/Qt/bin/Qt6Widgets.dll"))

build_exe_options = {
    # 사용 모듈만 최소 포함. 필요 시 QtNetwork/QtSvg 등 추가
    "includes": [
        "PySide6.QtWidgets",
        "PySide6.QtGui",
        "PySide6.QtCore",
        "PySide6.QtUiTools",
    ],
    "packages": ["shiboken6"],
    "include_files": include_files,
    # 불필요한 것/충돌 가능성 있는 것 제외 (원하면 줄이거나 조정)
    "excludes": [
        "tkinter", "distutils", "unittest", "email", "setuptools",
        "PySide6.Qt3DAnimation", "PySide6.Qt3DCore", "PySide6.Qt3DExtras", "PySide6.Qt3DInput",
        "PySide6.Qt3DLogic", "PySide6.Qt3DRender",
        "PySide6.QtBluetooth", "PySide6.QtConcurrent", "PySide6.QtDBus",
        "PySide6.QtDataVisualization", "PySide6.QtHelp", "PySide6.QtLocation",
        "PySide6.QtMultimedia", "PySide6.QtMultimediaWidgets",
        "PySide6.QtNetwork",        # 네트워크 안 쓰면 제외
        "PySide6.QtNfc",
        "PySide6.QtOpenGL", "PySide6.QtOpenGLWidgets",
        "PySide6.QtPositioning", "PySide6.QtPrintSupport",  # 인쇄 기능 안 쓰면 제외
        "PySide6.QtQml", "PySide6.QtQmlModels", "PySide6.QtQmlWorkerScript",
        "PySide6.QtQuick", "PySide6.QtQuickControls2", "PySide6.QtQuickWidgets",
        "PySide6.QtRemoteObjects", "PySide6.QtScxml", "PySide6.QtSensors",
        "PySide6.QtSerialPort", "PySide6.QtSql", "PySide6.QtStateMachine",
        "PySide6.QtSvg", "PySide6.QtSvgWidgets",
        "PySide6.QtTest", "PySide6.QtTextToSpeech",
        "PySide6.QtWebChannel", "PySide6.QtWebEngineCore",
        "PySide6.QtWebEngineQuick", "PySide6.QtWebEngineWidgets",
        "PySide6.QtWebSockets", "PySide6.QtXml",
        # 번역/도구 계열
        "PySide6.support",
    ],
    "include_msvcr": True,     # MSVC 런타임 자동 포함(윈도우 배포에 필수)
    # 파이썬 패키지를 zip에 묶지 않음(모듈 로딩 이슈 회피)
    "zip_include_packages": [],
    "zip_exclude_packages": ["*"],
    # "optimize": 2,           # 크기/속도 미세 조정 원하면 사용
}

# 디버깅 시엔 base=None(콘솔창 확인), 배포는 Win32GUI
base = "Win32GUI" if sys.platform.startswith("win") else None

executables = [
    Executable(
        script="main.py",
        base=base,
        target_name="stm32_downloader.exe",
        icon="logo_icon.ico",
    )
]

setup(
    name="STM32_Downloader",
    version="1.0",
    description="STM32 Flash GUI Tool",
    author="JO",
    options={"build_exe": build_exe_options},
    executables=executables,
)
