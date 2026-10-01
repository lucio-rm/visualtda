def longest_common_subsequence(s1: str, s2: str) -> str:
    """
    Given two strings s1 and s2, finds their Longest Common Subsequence (LCS).

    Time Complexity: O(m * n) where m = len(s1), n = len(s2).
    Space Complexity: O(m * n) for the 2D DP matrix.

    Returns the string representing the optimal common subsequence.
    """
    m = len(s1)
    n = len(s2)

    if m == 0 or n == 0:
        return ""

    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Bottom-up matrix construction
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # Traceback optimal path reconstruction
    result = []
    i = m
    j = n
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            result.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    result.reverse()
    return "".join(result)


# Backward-compatible entry-point alias
subsecuencia_comun_mas_larga = longest_common_subsequence
