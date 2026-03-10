import json

def generate_dfs(start="A", output_file="trace_dfs.json"):
    nodes = {
        "A": {"x": 300, "y": 50},
        "B": {"x": 150, "y": 150},
        "C": {"x": 450, "y": 150},
        "D": {"x": 100, "y": 280},
        "E": {"x": 200, "y": 280},
    }

    adj = {
        "A": ["B", "C"],
        "B": ["D", "E"],
        "C": [],
        "D": [],
        "E": [],
    }

    code = [
        "def dfs(node):",
        "    visited.add(node)",
        "    for neighbor in adj[node]:",
        "        if neighbor not in visited:",
        "            dfs(neighbor)",
    ]

    DEFAULT = "var(--node-default)"
    ACTIVE  = "var(--node-active)"
    VISITED = "var(--node-visited)"

    # Single uniform pause — the player controls all timing.
    STEP = 500

    trace = []

    def emit(*commands):
        trace.extend(commands)

    def pause():
        return {"action": "pause", "ms": STEP}

    def log(text):
        return {"action": "log", "text": text}

    def highlight(line):
        return {"action": "highlight_line", "line": line}

    def node_color(id, color):
        return {"action": "set_node_color", "id": id, "color": color}

    def node_active(id, active):
        return {"action": "set_node_active", "id": id, "active": active}

    emit(
        {"action": "init_code",  "lines": code},
        {"action": "init_graph", "nodes": nodes, "edges": adj},
        log(f"Starting DFS from node {start}"),
        pause(),
    )

    visited = set()

    def dfs(u):
        visited.add(u)

        emit(
            highlight(1),
            node_color(u, ACTIVE),
            node_active(u, True),
            log(f"Visiting: {u}"),
            pause(),
            highlight(2),
            pause(),
        )

        for v in adj[u]:
            emit(
                highlight(3),
                log(f"Checking neighbor {v} of {u}"),
                pause(),
            )

            if v not in visited:
                emit(highlight(4), pause())
                dfs(v)
                emit(
                    node_color(u, ACTIVE),
                    node_active(u, True),
                    log(f"Back at {u}"),
                    pause(),
                )

        emit(
            node_color(u, VISITED),
            node_active(u, False),
            log(f"Finished: {u}"),
            pause(),
        )

    dfs(start)

    emit(
        highlight(1),
        log("DFS complete."),
        pause(),
    )

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2, ensure_ascii=False)

    print(f"Generated {output_file}")


if __name__ == "__main__":
    generate_dfs()