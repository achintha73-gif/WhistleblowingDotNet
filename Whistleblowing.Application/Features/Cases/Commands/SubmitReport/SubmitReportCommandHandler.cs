using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Application.Features.Cases.Commands.SubmitReport;

public class SubmitReportCommandHandler : IRequestHandler<SubmitReportCommand, int>
{
    private readonly IApplicationDbContext _context;

    public SubmitReportCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(SubmitReportCommand request, CancellationToken cancellationToken)
    {
        var caseExists = await _context.Cases.AnyAsync(c => c.CaseId == request.CaseId, cancellationToken);
        if (!caseExists) return 0;

        var report = new InvestigationReport
        {
            CaseId = request.CaseId,
            Findings = request.Findings,
            Recommendation = request.Recommendation,
            CreatedAt = DateTime.UtcNow
        };

        _context.InvestigationReports.Add(report);
        await _context.SaveChangesAsync(cancellationToken);

        return report.ReportId;
    }
}