# Replicate API Setup — AI Wall Segmentation

The Paint Vestimator's Visualiser tab uses Replicate to detect walls in uploaded room photos.
The API key lives **only** in the Supabase Edge Function — it is never sent to the browser.

## 1. Get a Replicate account

Sign up at <https://replicate.com> and create an API token in your account settings.

## 2. Set the secret in Supabase

```bash
supabase secrets set REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Verify it was set:

```bash
supabase secrets list
```

## 3. Deploy the Edge Function

```bash
supabase functions deploy segment-walls --no-verify-jwt
```

The function is at `supabase/functions/segment-walls/index.ts`.

## 4. Models used

| Role     | Model | Replicate version |
|----------|-------|-------------------|
| Primary  | SAM 2 (Meta Segment Anything Model 2) | `fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83` |
| Fallback | CLIPSeg (prompt: "wall") | `2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591` |

If SAM 2 returns no output, CLIPSeg is tried automatically.
If both fail, the frontend falls back to a full-image colour overlay (no segmentation).

## 5. Costs

Replicate bills per prediction. SAM 2 typically costs ~$0.002–0.005 per image.
Monitor usage at <https://replicate.com/account/billing>.

## 6. Local development

The Edge Function can be tested locally via:

```bash
supabase functions serve segment-walls --env-file .env.local
```

Where `.env.local` contains:

```
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Never commit `.env.local` to version control.**

## 7. Security notes

- The Replicate API key is stored as a Supabase secret, not an environment variable in the frontend.
- The frontend only sends the image (base64-encoded) to the Supabase Edge Function.
- The Edge Function calls Replicate, then returns only the mask URL to the frontend.
- The anon key (`VITE_SUPABASE_ANON_KEY`) is public by design; it only permits calling `verify_jwt = false` functions.
