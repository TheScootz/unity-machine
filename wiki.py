import wikipedia, sys, json
pageRequested = sys.argv[1]
sentJson = {}
try:
    sentJson['data'] = wikipedia.WikipediaPage(title = pageRequested).summary
except wikipedia.exceptions.DisambiguationError as e: # Disimbugation
    sentJson['data'] = str(e)
    sentJson['type'] = "OK"
except wikipedia.exceptions.PageError as e: # Page does not exist
    sentJson['data'] = f'Error: The page "{pageRequested}" does not exist.' 
    sentJson['type'] = "OK"
except Exception as e:
    sentJson['data'] = str(e)
    sentJson['type'] = "Error"
else:
    sentJson['type'] = "OK"
    if len(sentJson['data']) > 2000: # Too long
        sentJson['data'] = sentJson['data'][:1997] + "..."
finally:
    print(json.dumps(sentJson))
    sys.stdout.flush()