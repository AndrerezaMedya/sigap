@echo off
setlocal enabledelayedexpansion

echo === npm run lint ===
npm run lint
set lint_exit=!errorlevel!
echo Exit Code: !lint_exit!
echo.

echo === npm run typecheck ===
npm run typecheck
set typecheck_exit=!errorlevel!
echo Exit Code: !typecheck_exit!
echo.

echo === npm run build ===
npm run build
set build_exit=!errorlevel!
echo Exit Code: !build_exit!
echo.

echo === SUMMARY ===
if !lint_exit! equ 0 (
    echo lint: PASS ^(exit code: !lint_exit!^)
) else (
    echo lint: FAIL ^(exit code: !lint_exit!^)
)

if !typecheck_exit! equ 0 (
    echo typecheck: PASS ^(exit code: !typecheck_exit!^)
) else (
    echo typecheck: FAIL ^(exit code: !typecheck_exit!^)
)

if !build_exit! equ 0 (
    echo build: PASS ^(exit code: !build_exit!^)
) else (
    echo build: FAIL ^(exit code: !build_exit!^)
)

endlocal
