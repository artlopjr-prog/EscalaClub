# EscalaClub — Deploy a Vercel
# Ejecuta estos comandos en tu terminal local

# 1. Clonar/copiar el proyecto y entrar al directorio
cd escalaclub

# 2. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 3. Login con tu cuenta de Vercel (Arturo)
vercel login

# 4. Deploy (primera vez — te pedirá crear/linkar proyecto)
vercel --prod

# Cuando te pregunte:
# - Set up and deploy? → Y
# - Which scope? → tu cuenta personal o team
# - Link to existing project? → N (crear nuevo)
# - Project name? → escalaclub
# - Framework? → Next.js (auto-detectado)

# 5. Variables de entorno — agregar en Vercel Dashboard
# O con CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# → https://zvajoinesuvbfmhguxbc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# → sb_publishable_OEmsXnj-FZFP5zQqcwQImw_JU47XTsU

vercel env add NEXT_PUBLIC_PAYPAL_CLIENT_ID
# → (dejar vacío por ahora — sandbox mode activo)

vercel env add NEXT_PUBLIC_APP_URL
# → https://tu-url.vercel.app (después del primer deploy)

# 6. Re-deploy con variables
vercel --prod

# ============================
# CUANDO TENGAS PAYPAL BUSINESS
# ============================
# Agregar Client ID real:
vercel env add NEXT_PUBLIC_PAYPAL_CLIENT_ID
# → AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxL (Client ID real)

# Y los Plan IDs de cada suscripción:
vercel env add NEXT_PUBLIC_PP_STARTER_MONTHLY  # → P-XXXXXXXXXXXXXXXXXX
vercel env add NEXT_PUBLIC_PP_STARTER_ANNUAL   # → P-XXXXXXXXXXXXXXXXXX
vercel env add NEXT_PUBLIC_PP_CREATOR_MONTHLY  # → P-XXXXXXXXXXXXXXXXXX
vercel env add NEXT_PUBLIC_PP_CREATOR_ANNUAL   # → P-XXXXXXXXXXXXXXXXXX
vercel env add NEXT_PUBLIC_PP_PRO_MONTHLY      # → P-XXXXXXXXXXXXXXXXXX
vercel env add NEXT_PUBLIC_PP_PRO_ANNUAL       # → P-XXXXXXXXXXXXXXXXXX
