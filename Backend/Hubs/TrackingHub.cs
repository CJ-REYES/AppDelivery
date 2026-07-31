using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs;

[Authorize]
public sealed class TrackingHub(AppDbContext database) : Hub
{
    public async Task SubscribeToOrder(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var userIdValue = Context.User?.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new HubException("La sesión no es válida.");
        }

        var order = await database.Orders
            .AsNoTracking()
            .Include(entity => entity.Store)
            .Include(entity => entity.DeliveryAssignments)
                .ThenInclude(entity => entity.DriverProfile)
            .SingleOrDefaultAsync(
                entity => entity.Id == orderId,
                cancellationToken
            );
        var canRead =
            order is not null
            && (
                Context.User?.IsInRole("Admin") == true
                || order.CustomerId == userId
                || order.Store.OwnerId == userId
                || order.DeliveryAssignments.Any(assignment =>
                    assignment.Status
                        is not DeliveryAssignmentStatus.Rejected
                            and not DeliveryAssignmentStatus.Cancelled
                    && assignment.DriverProfile.UserId == userId
                )
            );

        if (!canRead)
        {
            throw new HubException(
                "No se encontró el pedido solicitado."
            );
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            OrderGroup(orderId),
            cancellationToken
        );
    }

    public static string OrderGroup(Guid orderId) =>
        $"order:{orderId:N}";
}
