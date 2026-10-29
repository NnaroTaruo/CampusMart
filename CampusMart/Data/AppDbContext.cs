using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CampusMart.Models.Entities;

namespace CampusMart.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        // Floor Management
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Stall> Stalls { get; set; }
        public DbSet<StallItem> StallItems { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Cart → User (one-to-one)
            builder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithOne(u => u.Cart)
                .HasForeignKey<Cart>(c => c.UserId);

            // Order → User
            builder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            // CartItem → Product
            builder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId);

            // CartItem → StallItem
            builder.Entity<CartItem>()
                .HasOne(ci => ci.StallItem)
                .WithMany()
                .HasForeignKey(ci => ci.StallItemId);

            // OrderItem → Product
            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId);

            // OrderItem → StallItem
            builder.Entity<OrderItem>()
                .HasOne(oi => oi.StallItem)
                .WithMany()
                .HasForeignKey(oi => oi.StallItemId);

            // Product → Category
            builder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            // Floor → Stalls (one-to-many)
            builder.Entity<Stall>()
                .HasOne(s => s.Floor)
                .WithMany(f => f.Stalls)
                .HasForeignKey(s => s.FloorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Stall → StallItems (one-to-many)
            builder.Entity<StallItem>()
                .HasOne(si => si.Stall)
                .WithMany(s => s.StallItems)
                .HasForeignKey(si => si.StallId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed categories
            builder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Textbooks & Academics", Descscription = "Academic books and study materials" },
                new Category { Id = 2, Name = "Electronics & Gadgets", Descscription = "Tech devices and accessories" },
                new Category { Id = 3, Name = "Dorm Essentials", Descscription = "Everything for campus living" },
                new Category { Id = 4, Name = "Clothing & Apparel", Descscription = "Campus fashion and merch" },
                new Category { Id = 5, Name = "Stationery & Supplies", Descscription = "Writing instruments and planners" },
                new Category { Id = 6, Name = "Food & Beverages", Descscription = "Snacks, drinks and meal items" },
                new Category { Id = 7, Name = "Other", Descscription = "Miscellaneous items" }
            );
        }
    }
}

