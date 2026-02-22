import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/checklists-app/' to match your GitHub repo name
// e.g. if your repo is github.com/yourname/my-checklists → '/my-checklists/'
export default defineConfig({
  plugins: [react()],
  base: '/checklists-app/',
})
