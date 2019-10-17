import praw, sys, random, json, prawcore
reddit = praw.Reddit(user_agent="Script", client_id="OXxg6ARtXWPgzA", client_secret="hzJnxFZxbu6FGlz23I7NeNwY-2s")
subName = sys.argv[1]
posts = int(sys.argv[2])
sticky = json.loads(sys.argv[3].lower())

try:
    sub = reddit.subreddits.search_by_name(subName, exact=True)[0] # Search exact
except (Exception) as e:
    print(f"Error Message: {e}")
    sys.stdout.flush()
    sys.exit()

try:
    sub.quaran.opt_in()
except prawcore.exceptions.Forbidden: # Not quarantined
    pass
except (Exception) as e:
    print(f"Error Message: {e}")
    sys.stdout.flush()
    sys.exit()

try:
    sub.over18
except prawcore.exceptions.Forbidden: # Private
    print("Error Message: Subreddit is private.")
    sys.stdout.flush()
    sys.exit()

if sub.over18: # NSFW Subreddit
    print("Error Message: No NSFW subreddits allowed.")
    sys.stdout.flush()
    sys.exit()

submissions = [submission for submission in sub.hot(limit=posts)] # Hottest posts
stickyPost = 0
if not sticky: # No sticky posts
    while submissions[0].stickied: # While first submission is a sticky post
        for submission in submissions:
            if submission.stickied:
                stickyPost += 1
        submissions = [submission for submission in sub.hot(limit=posts+stickyPost)][stickyPost:] # Exclude sticky posts
    
nsfwPost = 0
while any([submission.over_18 for submission in submissions]):
    for submission in submissions:
        if submission.over_18:
            nsfwPost += 1
    submissions = [submission for submission in sub.hot(limit=posts+stickyPost+nsfwPost)][stickyPost:]
    submissions = [i for i in submissions if not i.over_18] # Filter all NSFW posts
    
submission = random.choice(submissions) # Random submission
submissionDict = {}
submissionDict["score"] = submission.score
submissionDict["title"] = submission.title
submissionDict["url"] = f"https://reddit.com/{submission.id}"

if submission.is_self:
    submissionDict["type"] = "Post"
    if len(submission.selftext) > 2000: # Too long
        submissionDict["content"] = submission.selftext[:1997] + "..." # Limit length of content
    else:
        submissionDict["content"] = submission.selftext
else:
    submissionDict["content"] = submission.url
    if submission.url.endswith(('.gif', '.jpg', '.png', '.jpeg', '.tiff')): # Is a photo
        submissionDict["type"] = "Image"
    else:
        submissionDict["type"] = "Link"
print(json.dumps(submissionDict))
sys.stdout.flush()