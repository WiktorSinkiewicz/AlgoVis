import json

def generate_bubble_sort(arr=None, output_file="trace_bubble.json"):
    arr = list(arr or [45, 12, 35, 8, 50, 22])
    n = len(arr)

    code = [
        "def bubble_sort(arr):",
        "    for i in range(len(arr)):",
        "        for j in range(len(arr) - i - 1):",
        "            if arr[j] > arr[j+1]:",
        "                swap(arr, j, j+1)",
    ]

    DEFAULT = "var(--bar-default)"
    ACTIVE  = "var(--bar-active)"
    SORTED  = "var(--bar-sorted)"

    # Every pause is identical — the player controls timing via the speed slider.
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
        log(f"Starting bubble sort on {arr}"),
        pause(),
    )

    for i in range(n):
        emit(highlight(2), pause())

        for j in range(n - i - 1):
            emit(
                highlight(3),
                bar_color(j,   ACTIVE),
                bar_color(j+1, ACTIVE),
                log(f"Comparing arr[{j}]={arr[j]} and arr[{j+1}]={arr[j+1]}"),
                pause(),
                highlight(4),
                pause(),
            )

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                emit(
                    highlight(5),
                    log(f"Swapping  →  arr[{j}]={arr[j]}, arr[{j+1}]={arr[j+1]}"),
                    {"action": "swap", "index1": j, "index2": j + 1},
                    pause(),
                )

            emit(bar_color(j, DEFAULT), bar_color(j + 1, DEFAULT), pause())

        emit(bar_color(n - i - 1, SORTED), pause())

    emit(
        highlight(1),
        log(f"Done. Sorted array: {arr}"),
        pause(),
    )

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2, ensure_ascii=False)

    print(f"Generated {output_file}")


if __name__ == "__main__":
    generate_bubble_sort()