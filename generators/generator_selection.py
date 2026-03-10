import json

def generate_selection_sort(arr=None, output_file="trace_selection.json"):
    arr = list(arr or [38, 14, 52, 7, 29, 41])
    n = len(arr)

    code = [
        "def selection_sort(arr):",
        "    for i in range(len(arr)):",
        "        min_idx = i",
        "        for j in range(i+1, len(arr)):",
        "            if arr[j] < arr[min_idx]:",
        "                min_idx = j",
        "        swap(arr, i, min_idx)",
    ]

    DEFAULT = "var(--bar-default)"
    ACTIVE  = "var(--bar-active)"
    SORTED  = "var(--bar-sorted)"
    MIN     = "#e5c07b"

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

    def bar_color(index, color):
        return {"action": "set_bar_color", "index": index, "color": color}

    emit(
        {"action": "init_code",  "lines": code},
        {"action": "init_array", "data": list(arr)},
        log(f"Starting selection sort on {arr}"),
        pause(),
    )

    for i in range(n):
        min_idx = i

        emit(
            highlight(2),
            bar_color(i, MIN),
            log(f"Pass {i+1}: current minimum is arr[{i}]={arr[i]}"),
            pause(),
        )

        for j in range(i + 1, n):
            emit(
                highlight(4),
                bar_color(j, ACTIVE),
                log(f"Comparing arr[{j}]={arr[j]} with current min arr[{min_idx}]={arr[min_idx]}"),
                pause(),
                highlight(5),
                pause(),
            )

            if arr[j] < arr[min_idx]:
                emit(bar_color(min_idx, DEFAULT if min_idx != i else MIN))
                min_idx = j
                emit(
                    highlight(6),
                    bar_color(min_idx, MIN),
                    log(f"New minimum found: arr[{min_idx}]={arr[min_idx]}"),
                    pause(),
                )
            else:
                emit(bar_color(j, DEFAULT), pause())

        emit(
            highlight(7),
            bar_color(i,       ACTIVE),
            bar_color(min_idx, ACTIVE),
            log(f"Swapping arr[{i}]={arr[i]} with arr[{min_idx}]={arr[min_idx]}"),
            pause(),
        )

        arr[i], arr[min_idx] = arr[min_idx], arr[i]

        if min_idx != i:
            emit(
                {"action": "swap", "index1": i, "index2": min_idx},
                pause(),
                bar_color(i,       SORTED),
                bar_color(min_idx, DEFAULT),
                log(f"arr[{i}]={arr[i]} is in its final position"),
                pause(),
            )
        else:
            emit(
                pause(),
                bar_color(i, SORTED),
                log(f"arr[{i}]={arr[i]} is already in its final position"),
                pause(),
            )

    emit(
        highlight(2),
        log(f"Done. Sorted array: {arr}"),
        pause(),
    )

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2, ensure_ascii=False)

    print(f"Generated {output_file}")


if __name__ == "__main__":
    generate_selection_sort()