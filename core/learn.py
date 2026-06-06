from LVTP.core.knowledge import remember
import json
import datetime

def learn(kind,title,solution):

    remember(
        kind=kind,
        title=title,
        solution=solution
    )

    return {
        "time": datetime.datetime.now().isoformat(),
        "status": "LEARNED",
        "kind": kind,
        "title": title
    }

if __name__ == "__main__":

    result = learn(
        "incident",
        "Git repository initialized",
        "Initialize git repository before sync engine execution"
    )

    print(json.dumps(result,indent=2))
