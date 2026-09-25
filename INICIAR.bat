@echo off
echo ========================================
echo    VendasBrusque - Iniciando projeto
echo ========================================
echo.

:: Verifica Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo Baixe a versao LTS e reinicie o terminal apos instalar.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

:: Instala dependencias se necessario
if not exist "node_modules" (
    echo [1/3] Instalando dependencias npm...
    npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
    echo.
)

:: Configura banco de dados
echo [2/3] Configurando banco de dados...
npx prisma db push --skip-generate >nul 2>&1
npx prisma generate >nul 2>&1
echo [OK] Banco configurado

:: Seed inicial
echo [3/3] Populando dados iniciais...
node prisma/seed.js
echo.

echo ========================================
echo    Iniciando servidor em:
echo    http://localhost:3000
echo ========================================
echo.
echo Para parar: pressione Ctrl+C
echo.

npm run dev
