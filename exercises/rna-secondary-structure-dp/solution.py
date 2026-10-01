def rna_secondary_structure(sequence: str) -> int:
    """
    sequence: string of RNA bases {A, U, C, G}.
    Returns the maximum number of non-crossing base pairs.
    """
    n = len(sequence)
    if n < 5:
        return 0
    valid_pairs = {('A', 'U'), ('U', 'A'), ('C', 'G'), ('G', 'C')}
    dp = [[0] * n for _ in range(n)]

    for length in range(5, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            max_p = dp[i][j - 1]
            for t in range(i, j - 4):
                if (sequence[t], sequence[j]) in valid_pairs:
                    left_val = dp[i][t - 1] if t > i else 0
                    center_val = dp[t + 1][j - 1]
                    max_p = max(max_p, 1 + left_val + center_val)
            dp[i][j] = max_p

    return dp[0][n - 1]


# Backward-compatible entry-point alias
estructura_secundaria_arn = rna_secondary_structure
