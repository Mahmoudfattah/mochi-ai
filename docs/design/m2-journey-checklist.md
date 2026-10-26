# M2 founder journey checklist

This checklist uses Demo mode. Every permission, speech, and reply action is a
simulation; the app does not turn on the phone microphone or contact an online
service.

## Open the production preview

1. In the project folder, run:

   ```powershell
   npm run build
   npm run preview -- --host
   ```

2. Open the local preview URL shown in the terminal. To open it on a phone on
   the same Wi-Fi network, use the computer's local network address and the
   preview port printed by Vite, for example
   `http://192.168.1.20:4173/?dev=1`.
3. If the phone cannot connect, allow Node.js or the preview port through the
   Windows Defender Firewall for the private network. Avoid exposing the
   preview to a public network.
4. The small “عرض تجريبي” control opens the Demo toolbar. In a production build,
   `?dev=1` makes the control available. The `D` key also toggles the toolbar
   when focus is not in an input.
5. To repeat the first-visit flow, use a private browser window or clear this
   site's local storage before reloading. The completion flag is named
   `onboarding_completed`.

## 1.1 First visit and microphone permission

- [ ] Open with first-visit storage cleared. The dark screen shows Mochi, the
      microphone indicator says it is off, and the two onboarding lines appear.
- [ ] Touch Mochi. The indicator changes to the waiting-for-permission state;
      the short permission explanation appears. No listening starts automatically.
- [ ] Open the Demo toolbar and choose **سماح بالمايك**. The character enters
      listening and the indicator says it is listening.
- [ ] Use **محاكاة كلام** with the sample transcript. Confirm the user transcript
      appears, the state passes through hearing/thinking, and the canned reply is
      shown while Mochi speaks.
- [ ] Wait for speech to finish. The follow-up indicator appears, then returns
      to off/Idle after about 5 seconds.
- [ ] Confirm the onboarding lines do not return after the first touch.

Expected microphone sequence: **off → waiting → listening → off** (with a
temporary follow-up state before the final off state).

## 1.2 Returning visit

- [ ] Reload after the onboarding flag has been set. The home screen has no
      persistent hint lines; the microphone is off.
- [ ] Touch Mochi. Listening begins only after this explicit touch.
- [ ] Repeat the sample-speech flow. The transcript and canned response are
      temporary captions, not a persistent conversation history.
- [ ] Wait for the follow-up window to expire. Confirm the character remains
      idle and the microphone is off.

Expected microphone sequence: **off → listening → follow-up → off**.

## 1.3 Installed PWA / phone lifecycle

- [ ] On the phone, open the preview in the foreground and touch Mochi to start
      the mock listening session.
- [ ] Switch to another app or browser tab, then return. The stage should be
      idle with the mic off; it must not resume listening automatically.
- [ ] Touch Mochi again to start a new session.

This M2 demo does not install a PWA or exercise real background microphone
behavior. The app deliberately stops mock capture on a hidden page. Actual PWA
and operating-system behavior remains a device test.

## 1.4 Permission denied or revoked

- [ ] From Idle, touch Mochi and choose **رفض الإذن** in the toolbar.
- [ ] Confirm the permission recovery card appears, the mic is unavailable/off,
      and the collapsible browser-help steps are available.
- [ ] Choose **كمّل بالكتابة دلوقتي**, enter a short phrase, and submit. Confirm
      the same hearing/thinking/speaking mock flow is used.
- [ ] Start a new session, grant permission, then choose **إلغاء الإذن** while
      listening. Confirm the state changes immediately to an error and the mic no
      longer says it is active.
- [ ] For retry, choose **إعادة المحاولة** after granting permission in the
      toolbar. Confirm listening starts only through that explicit retry.

## 1.5 Speech not understood / noisy room

- [ ] Start listening, then choose **محاكاة خطأ في التعرف**.
- [ ] Confirm a recognition-error card appears and the indicator does not claim
      that the microphone is active.
- [ ] Choose retry and simulate another recognition error. Confirm typing
      remains available as a fallback and no repeated automatic retry occurs.
- [ ] Use the typing fallback and submit a phrase. Confirm it follows the same
      mock response sequence.

The toolbar supplies deterministic error events; it does not test real room
noise or Arabic recognition quality.

## 1.6 Offline or service error

- [ ] Choose **فصل الاتصال**. The offline recovery card appears with typing and
      retry options. The microphone indicator continues to describe capture
      separately from service availability.
- [ ] Choose typing, submit a short phrase, and confirm the mock-only response
      flow works while a small service-unavailable notice remains visible.
- [ ] Choose **عودة الاتصال**. Confirm the page offers recovery without
      automatically restarting the microphone. Use retry or touch Mochi to start
      again.
- [ ] To simulate a service failure, choose **محاكاة خطأ في الخدمة** before
      sending sample speech. Confirm a general service-error card appears with
      retry and typing options.

The offline typed reply is a local Demo-mode mock, not an online request or
evidence that an offline request was executed.

## Visual and performance check

- [ ] Compare the home stage at 380px wide and desktop against screens 1A, 1B,
      2, 3, 9, 10A, and 10B in
      [`mochi-screens.html`](./mochi-screens.html).
- [ ] On the Galaxy A51, use the production preview (not `npm run dev`) and
      check for dropped frames, delayed touch response, layout overflow, and
      readable captions. The `#gallery` page contains the character frame-rate
      probe; record the device, browser, viewport, observed frame rate, and any
      jank before founder approval.
- [ ] Remember that captions, provider events, and replies in M2 are
      demonstrations; no confirmation card, schedule change, persistent history,
      real voice engine, or real service is part of this milestone.
