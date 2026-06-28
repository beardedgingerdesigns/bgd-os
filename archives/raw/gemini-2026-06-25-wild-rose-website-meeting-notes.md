---
kind: gemini-sweep
source_file_id: 15t_mRY8SsAlUHaZh9m0EtDO_cU5smRD7yVzd3cQA3Pk
source_title: "Wild Rose Website Meeting - 2026/06/25 13:00 CDT - Notes by Gemini"
type: notes
date: 2026-06-25
participants:
  - Justin Lobaito <justin@beardedgingerdesigns.com>
  - Meghan Wymore <meghan.wymore@wildrosecorporate.com>
  - Jon Liebl <jon@lieblmg.com>
  - Krystal Light <krystal.light@wildrosecorporate.com>
  - Aaron Harn <aaron.harn@wildrosecorporate.com>
  - Katrina Williams <katrina.williams@wildroseresorts.com>
matched_projects:
  - wild-rose-redesign
dispatch_to:
  - target: project-wiki
    path_hint: raw/gemini/
  - target: aios-wiki
    path_hint: raw/research/
swept_at: 2026-06-25T18:27:22Z
---

# Notes

Jun 25, 2026

## Wild Rose Website Meeting

Invited Justin Lobaito, Meghan Wymore, Jon Liebl, Krystal Light, Aaron Harn, Katrina Williams

### Summary

The team synchronized backend website requirements, optimized content workflows, and established pre-launch integration strategies.

**Website Content And Alignment**
Backend content was synchronized for the July 13 launch to ensure alignment. A decision was made to update location display logic to show only selected venues via comma-separated lists.

**Workflow And Optimization Improvements**
Enhancements were established for Search Engine Optimization preview functionality and automated Human Resources notification systems. The system will now support automated printing for employee application documents.

**Integration And Launch Planning**
Existing URL structures remain stable to ensure QR code functionality post-launch. The team reviewed the new careers section layout and requirements for Indeed integration testing.

### Decisions

**Aligned**

- **Entertainment categories display enabled** The entertainment category display will be enabled on the entertainment page to allow for proper filtering.
- **Description box field retired** The unused description box field on the entertainment page will be retired from the backend.
- **Promotions calendars removal planned** Promotions calendars will be removed from the backend entirely following the July 13th launch.
- **Location list display updated** The 'All locations' label will be replaced with a comma-separated list of individual locations for clarity.
- **Final QA process established** A final QA and content review session will be conducted with the team prior to the July 13th launch.
- **Existing URL structures maintained** Current site URL structures will be maintained for the launch without changes.
- **Printable HR application view developed** A printable, single-page view feature will be implemented for HR applications to match current form formatting.
- **Thumbnail upload process corrected** The entertainment entry thumbnail upload process will be streamlined to allow direct image addition without requiring an intermediate save.

### Next steps

- [Justin] Display Categories: Configure category display to show as a filter on the entertainment page once the categories are populated.
- [Justin] Fix Preview Bug: Investigate and resolve the bug preventing category previews in the entertainment section.
- [Meghan Wymore] Report Thumbnail Bug: Send examples of thumbnail saving issues to Justin if they occur again.
- [Justin] Map SEO Data: Map SEO images and custom text fields to populate automatically from content blocks.
- [Justin] Update Locations List: Update the location list display to show comma separated names instead of the all locations label.
- [Justin] Email Aaron: Draft an email to Aaron summarizing the project housekeeping items.
- [Justin] Prepare Content: Flesh out the remaining project content for the team to review.
- [Justin] Schedule QA Meeting: Propose meeting times to the team for a final project QA session next week.
- [Justin] Identify Print URL: Locate and provide the URL that allows printing of all employee information in one view.
- [Justin] Create PDF Template: Develop a pre-filled PDF template for employee applications based on the provided samples.
- [Krystal Light] Share PDF Samples: Send the current employee application PDF samples to Justin.
- [Katrina Williams] Verify Indeed Integration: Check data integration with Indeed after site launch to ensure job posting formats are correct.
- [Justin] Repair Thumbnail Workflow: Fix the thumbnail saving workflow in the entertainment section to match the promotions process.

### Details

- **Website Backend Synchronization and Launch Date**: Meghan Wymore and Justin Lobaito confirmed that any edits currently being made to the existing site must also be applied to the new backend to ensure alignment for the July 13th launch date.
- **Entertainment Category Display**: Meghan Wymore noted that the entertainment category was not appearing correctly during previews. Justin Lobaito agreed to begin displaying those categories and enabling them as a filter on the entertainment page.
- **Entertainment Description Field**: The description box is a legacy element from the old site that was not removed during streamlining. It is not being output to the live site and can be ignored.
- **Entertainment Trivia Preview Bug**: The newly added trivia section within the entertainment category was failing to generate a preview. Identified as a bug requiring investigation.
- **Promotions Calendar and Thumbnail Workflow**: Current calendars will remain until July 13th launch, then removed. Meghan Wymore raised a concern about needing to save entries before adding thumbnails; Justin agreed to fix the workflow.
- **SEO Preview Customization**: SEO image can auto-map from content image or be manually overridden. Description field should use the override function for custom text.
- **Location Display Logic**: Krystal Light requested showing individual location names instead of "all locations." Justin confirmed the code change.
- **Final QA and Pre-Launch Timeline**: Justin proposed content finalization followed by a QA session before July 13th. Krystal Light will be out next week (returning July 6th). Email with proposed times to follow.
- **QR Code and URL Structure Stability**: No URL structures are being changed; existing QR codes and links will remain functional.
- **HR Application Printing Functionality**: Katrina Williams requested a printable single-page view of employee applications. Justin confirmed a pre-filled PDF template approach using samples Krystal will provide.
- **HR Notification Workflow**: Adding additional recipients (recruiter Becca) to automated application notifications is straightforward to implement.
- **Employment Section and Indeed Integration**: New careers section presented. Katrina Williams to verify Indeed integration post-launch.

---

# Transcript

Jun 25, 2026

## Wild Rose Website Meeting - Transcript

### 00:00:00

**Meghan Wymore:** what I'm doing right now is anything that I'm adding to the current site, I'm also adding to this back end.

**Justin Lobaito:** Correct. So, this will be this will be everything that when we when we launch over in July,

**Meghan Wymore:** Okay.

**Justin Lobaito:** July 13th, when we do that,

**Meghan Wymore:** Yep.

**Justin Lobaito:** uh we need to make sure everything's loaded to be ready to go for July,

**Meghan Wymore:** Perfect. Okay.

**Justin Lobaito:** basically.

**Meghan Wymore:** I just was making sure you weren't like move like because I'm like, "Oh, wait. I should just double check." So yeah, if I'm making edits to anything that is still going to be live come July 13th, I'm also doing that on the new back end. Okay,

**Justin Lobaito:** That's correct.

**Meghan Wymore:** perfect.

### 00:01:03

**Meghan Wymore:** And again, perfect. And again, I'm just like letting you know because maybe I'm missing something. Okay, so for on entertainment, I put this one in when I go to preview. Um, a couple things on here. I don't know if the category is not pulling up the entertainment category.

**Justin Lobaito:** I think that's because I wasn't 100% sure if we're going to have those when we went to launch. So, I'm not putting those. But if you're filling those in, then I will just go ahead and start to display that and it'll also then be a filter on the entertainment page.

**Meghan Wymore:** Oh, perfect. And then next thing, this description box here, it's just pulling the info from down here. I don't feel like it's pulling the info from this description box.

**Justin Lobaito:** That can be retired. I didn't fully rewrite. So like we completely rewrote the promotions to be underneath the new thing for entertainment. We're taking over kind of the existing thing just making it more streamlined. I didn't delete the fields that we don't need any longer.

### 00:01:58

**Meghan Wymore:** And then sorry showing up the I added in trivia to the entertainment and it's not letting me pull up the preview.

**Justin Lobaito:** Let me look into that. That might just be a bug being uncovered.

### 00:02:56

**Justin Lobaito:** I'm gonna keep the calendars there until we go to launch and then then I'll just delete those entirely.

**Meghan Wymore:** It used to let me add a thumbnail. Like now I have to save an entry and then go back in and add the thumbnail. Is that normal?

### 00:03:43

**Meghan Wymore:** I'll if I find an example, I'll send that to you.

### 00:04:45

**Meghan Wymore:** Were you still working on that? This SEO preview. Would it populate or do I have to?

**Justin Lobaito:** I can map those to like the SEO image can pull from that image right there automatically. Otherwise you can override it. The custom text because we have like a big content block — you should rewrite the custom text for the description. Click on the override and write whatever you want it to be.

### 00:05:38

**Krystal Light:** The locations, don't forget about that.

**Meghan Wymore:** When I click Clinton, Emittsburg, Jefferson, we want it to show Clinton, Emittsburg, and Jefferson. It says all locations.

**Justin Lobaito:** Fair enough. I'm just doing that on the code side. Easy to take that out and just do a comma separated list.

### 00:07:52

**Justin Lobaito:** We're getting close to the 13th with the holiday being next week. I'm going to propose Crystal, I'm going to flesh out a bunch of the remaining content for your team to react to. From Wednesday next week till sometime before the 13th, we can do like a little final QA.

**Krystal Light:** I am out next week. But if you include Megan on the email, she can pass it out especially to some of the marketing managers.

### 00:09:42

**Krystal Light:** Anything that we have linked currently like QR codes on property with links to the menu — those technically should stay the same, right?

**Justin Lobaito:** We're not changing any URL structures. We're only adding a few things.

### 00:10:31

**Katrina Williams:** Is there a button or some way where I can print all of this information into one page?

**Justin Lobaito:** I do think we built something that you could go to a URL which would give you all that in one view and print from there.

### 00:12:23

**Katrina Williams:** I didn't know if there was some way on the back end where it would populate things to look exactly like our application and we could just print it.

**Justin Lobaito:** If you give me this PDF I can probably just give you something that's pre-filled out.

### 00:15:48

**Katrina Williams:** If there's a way I could add somebody else on. So like Becca, my recruiter would get it automatically as well.

**Justin Lobaito:** That's easy to do.

### 00:16:44

**Justin Lobaito:** Here's the new site. We have careers up here. It's just a much more simpler way for people to view the actual postings. They can filter by properties.

**Katrina Williams:** Is there anything on the back end I need to let Shaker know about? They're the ones pulling our job apps and posting them on Indeed.

**Justin Lobaito:** Check back once we launch. Yes.

### 00:17:37

**Meghan Wymore:** I found where that thumbnail thing is happening. If I go to new entertainment, these won't let me until I save it, close out of it, and then go back into it.

**Justin Lobaito:** I will take a look at this process. You should just be able to add it like promotions where you just add the image.

### Transcription ended after 00:19:30
