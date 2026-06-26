@echo off
echo Cancelando tarefa agendada: Angelica-Enviar-Limpeza-Segunda
echo.
schtasks /delete /tn "Angelica-Enviar-Limpeza-Segunda" /f
if %errorlevel%==0 (
    echo OK! Tarefa removida. Mensagens automaticas de segunda canceladas.
) else (
    echo Tarefa nao encontrada ou ja removida anteriormente.
)
echo.
pause
