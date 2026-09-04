using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Infrastructure.Persistence.Migrations;

public partial class SeedInitialData : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.Sql("""
            INSERT INTO "AspNetUsers" (
                "Id",
                "UserName",
                "NormalizedUserName",
                "Email",
                "NormalizedEmail",
                "EmailConfirmed",
                "LockoutEnabled",
                "TwoFactorEnabled",
                "PhoneNumberConfirmed",
                "AccessFailedCount",
                "AvatarUrl"
            )
            VALUES
                ('11111111-1111-1111-1111-111111111111', 'amyrobson', 'AMYROBSON', 'amyrobson@demo.local', 'AMYROBSON@DEMO.LOCAL', true, false, false, false, 0, '/images/avatars/image-amyrobson.png'),
                ('22222222-2222-2222-2222-222222222222', 'maxblagun', 'MAXBLAGUN', 'maxblagun@demo.local', 'MAXBLAGUN@DEMO.LOCAL', true, false, false, false, 0, '/images/avatars/image-maxblagun.png'),
                ('33333333-3333-3333-3333-333333333333', 'ramsesmiron', 'RAMSESMIRON', 'ramsesmiron@demo.local', 'RAMSESMIRON@DEMO.LOCAL', true, false, false, false, 0, '/images/avatars/image-ramsesmiron.png'),
                ('44444444-4444-4444-4444-444444444444', 'juliusomo', 'JULIUSOMO', 'juliusomo@demo.local', 'JULIUSOMO@DEMO.LOCAL', true, false, false, false, 0, '/images/avatars/image-juliusomo.png')
            ON CONFLICT ("Id") DO NOTHING;

            INSERT INTO "Comments" (
                "Id",
                "Content",
                "Score",
                "CreatedAt",
                "AuthorId",
                "ParentId"
            )
            VALUES
                (
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You''ve nailed the design and the responsiveness.',
                    12,
                    '2026-08-31T10:00:00Z',
                    '11111111-1111-1111-1111-111111111111',
                    NULL
                ),
                (
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    'Woah, your project looks awesome! How long have you been coding for? I''m still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!',
                    5,
                    '2026-09-01T12:00:00Z',
                    '22222222-2222-2222-2222-222222222222',
                    NULL
                ),
                (
                    'cccccccc-cccc-cccc-cccc-cccccccccccc',
                    'If you''re still new, I''d recommend focusing on the fundamentals of HTML, CSS, and JS before jumping into React. It''s very important to understand the basics first.',
                    4,
                    '2026-09-02T09:00:00Z',
                    '33333333-3333-3333-3333-333333333333',
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                ),
                (
                    'dddddddd-dddd-dddd-dddd-dddddddddddd',
                    'I couldn''t agree more with this. Everything moves so fast and it always seems like everyone knows the newest, hottest framework/library. But the fundamentals are what stay constant.',
                    2,
                    '2026-09-02T14:00:00Z',
                    '44444444-4444-4444-4444-444444444444',
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                )
            ON CONFLICT ("Id") DO NOTHING;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.Sql("""
            DELETE FROM "Comments"
            WHERE "Id" IN (
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                'cccccccc-cccc-cccc-cccc-cccccccccccc',
                'dddddddd-dddd-dddd-dddd-dddddddddddd'
            );

            DELETE FROM "AspNetUsers"
            WHERE "Id" IN (
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                '44444444-4444-4444-4444-444444444444'
            );
            """);
    }
}
