def minimizar_retraso_maximo(tasks: list[tuple[int, int]]) -> int:
    """
    tasks: list of tuples (duration t_i, deadline d_i).
    Returns the maximum lateness achieved.
    """
    sorted_tasks = sorted(tasks, key=lambda item: item[1])
    current_time = 0
    max_lateness = 0
    for t_i, d_i in sorted_tasks:
        current_time += t_i
        lateness = max(0, current_time - d_i)
        max_lateness = max(max_lateness, lateness)
    return max_lateness


minimize_maximum_lateness = minimizar_retraso_maximo

