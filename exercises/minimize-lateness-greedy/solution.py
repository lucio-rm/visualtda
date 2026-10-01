def minimize_lateness(tasks: list[tuple[int, int]]) -> int:
    """
    tasks: list of tuples (duration t_i, deadline d_i).
    Returns the maximum lateness achieved by earliest deadline first (EDF).
    """
    sorted_tasks = sorted(tasks, key=lambda item: item[1])
    current_time = 0
    max_lateness = 0
    for t_i, d_i in sorted_tasks:
        current_time += t_i
        lateness = max(0, current_time - d_i)
        max_lateness = max(max_lateness, lateness)
    return max_lateness


# Backward-compatible entry-point aliases
minimizar_retraso_maximo = minimize_lateness
minimize_maximum_lateness = minimize_lateness
