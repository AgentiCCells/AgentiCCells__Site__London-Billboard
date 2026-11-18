# Brief: london-billboard.agenticcells.site

Kept by conductor.london-billboard@AgentiCCells.dinis. The full brief is `requests/2026-11-18__london-billboard/brief.md` in AgentiCCells/AgentiCCells__Site__Factory (branch dev), with `white-paper.md` beside it. This file keeps Dinis Cruz's words, with the time they were given, and what the conductor took from them.

## Dinis's words

- 2026-11-18 ~16:10 UTC, in the cells@AgentiCCells.dinis session: "See if you can find what I've published before about the idea of creating some billboard ads in London with data, live data from the Algarve, even live stream of cameras ... we probably need to map the live stream of cameras to show what it looks like, because they're all public cameras, right? So in fact, why don't we experiment here?"
- 2026-11-18 ~17:30 UTC, same session, sharing his white paper and a 12-slide deck: "Ok, here is that idea I had, what do you think we should have just about all we need (I'm about to ask the data team if we can also collect the live video cameras from the region)".
- 2026-11-18 ~17:45 UTC, same session: "Cool, and yes this is 100% simulated, I just want to use it as a nice demo of what we can do with these ACC sites (and the data that we have on the multiple *.pt.news sites)".
- 2026-11-18 ~18:00 UTC, relayed by cells@AgentiCCells.dinis to this session, queued at 17:55 UTC by the server's clock (the "~18:00" is cells@'s approximate time for Dinis's words, so the two clocks differ by a few minutes): "This simulation of a billboard, which could be in London or other parts of Portugal too (since the weather is usually much better there) will be on one of our ACC.live sites. And will be 100% client side driven."

## What the conductor took from them

1. A 100% simulated demonstration of Dinis's weather-driven billboard, credited to him: a portrait screen (1080x1920, scaled to fit) that runs the white paper's three phases on live Algarve data from data.promptugal.news.
2. The screen's location is a choice: London (weather simulated by a control, labelled "simulated") or a Portuguese city (Porto, Braga, Lisbon), where the "here" side is real IPMA data read live (labelled "live"). Each side says whether it is live or simulated.
3. 100% client side: static files on GitHub Pages; the browser fetches data.promptugal.news; state lives in the URL or localStorage only; no server, no keys, no build-time copies of the data.
4. Cameras only through live.promptugal.news once it offers them. On 2026-11-18 it says "First version coming" and offers none, so the screen shows a drawn scene, marked as a drawing.
5. Flights, prices and travel times are invented examples, labelled so. The planning assistant behind the QR code is scripted (no live model), labelled a simulation.
6. White paper figures only with a primary source, or marked "source unconfirmed". No tourism body, operator, airline or advertiser named as involved. Name no person but Dinis Cruz.
7. The domain stays london-billboard.agenticcells.site for now; the copy says "London and other cities".
