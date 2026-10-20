namespace Whistleblowing.Application.Common;

/// <summary>
/// Generates human-readable, unique reference codes for anonymous complaints.
/// Format: WB-XXXX-XXXX
/// </summary>
public static class ReferenceCodeGenerator
{
    // Alphabet without ambiguous characters (0, O, I, 1)
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int SegmentLength = 4;

    public static string Generate()
    {
        var seg1 = GenerateSegment();
        var seg2 = GenerateSegment();
        return $"WB-{seg1}-{seg2}";
    }

    public static bool IsValidFormat(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        if (code.Length != 12) return false;
        if (!code.StartsWith("WB-")) return false;

        var parts = code.Split('-');
        if (parts.Length != 3) return false;
        if (parts[1].Length != 4 || parts[2].Length != 4) return false;

        foreach (var ch in parts[1] + parts[2])
        {
            if (!Alphabet.Contains(ch)) return false;
        }

        return true;
    }

    public static string Normalize(string code)
    {
        return (code ?? string.Empty).Trim().ToUpperInvariant();
    }

    private static string GenerateSegment()
    {
        var chars = new char[SegmentLength];
        for (int i = 0; i < SegmentLength; i++)
        {
            chars[i] = Alphabet[Random.Shared.Next(Alphabet.Length)];
        }
        return new string(chars);
    }
}