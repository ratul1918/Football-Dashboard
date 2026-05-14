# Deployment Checklist 

Before merging to `main` and triggering production deployment:

## Code Quality 
- [ ] `pnpm type-check` passes with no errors
- [ ] `pnpm build` completes successfully
- [ ] No console warnings or errors in local build
- [ ] Code is formatted and follows project conventions
 
## Security & Configuration
- [ ] No hardcoded API keys, tokens, or secrets in code
- [ ] `.env.example` is updated with any new environment variables
- [ ] Security headers in `vercel.json` are complete
- [ ] No sensitive information in git history

## Supabase & Backend
- [ ] Supabase Edge Function (`make-server-7950e5fa`) is deployed and healthy
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] All Supabase environment variables are configured in Vercel

## Testing
- [ ] All pages load without errors (Dashboard, Teams, Matches, Standings, Settings)
- [ ] Supabase connectivity works (data fetches/saves correctly)
- [ ] Export functionality works (PNG and CSV export)
- [ ] No console errors in browser DevTools

## Documentation
- [ ] README deployment section is updated if needed
- [ ] CHANGELOG or git commit message describes the change

## Vercel & Monitoring
- [ ] Vercel preview deployment URL works correctly
- [ ] Sentry DSN is configured in Vercel environment
- [ ] Vercel analytics are enabled
- [ ] Preview deployments are enabled for PRs

## Final Check
- [ ] PR has been reviewed and approved
- [ ] All CI/CD checks (GitHub Actions) pass
- [ ] Ready to merge to `main` and auto-deploy to production

---

**After Merge:**
- Monitor Sentry for any new errors in the first 15 minutes
- Check Vercel deployment progress
- Verify production URL loads correctly
- Test critical flows (add team, submit match, view standings)
