<?php

namespace Database\Seeders;

use App\Models\Link;
use App\Models\User;
use Illuminate\Database\Seeder;

class LinkSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('username', 'admin')->first();
        $john = User::where('username', 'johndoe')->first();

        $links = [
            // Active, permanent
            [
                'unique_id' => 'gh3xm1a',
                'link_target' => 'https://github.com',
                'passed' => 142,
                'is_active' => true,
                'valid_until' => null,
                'created_by' => $admin->id,
            ],
            // Active, permanent
            [
                'unique_id' => 'yt7kz2b',
                'link_target' => 'https://youtube.com',
                'passed' => 89,
                'is_active' => true,
                'valid_until' => null,
                'created_by' => $admin->id,
            ],
            // Active, will expire in 30 days
            [
                'unique_id' => 'lv9np3c',
                'link_target' => 'https://laravel.com/docs',
                'passed' => 33,
                'is_active' => true,
                'valid_until' => now()->addDays(30),
                'created_by' => $admin->id,
            ],
            // Active, already expired
            [
                'unique_id' => 'exp8rs4',
                'link_target' => 'https://example.com/promo-ended',
                'passed' => 201,
                'is_active' => true,
                'valid_until' => now()->subDays(1),
                'created_by' => $admin->id,
            ],
            // Soft-deleted
            [
                'unique_id' => 'del4qr5',
                'link_target' => 'https://example.com/deleted-page',
                'passed' => 7,
                'is_active' => false,
                'valid_until' => null,
                'created_by' => $admin->id,
                'deleted_at' => now()->subDays(2),
                'deleted_by' => $admin->id,
            ],
            // John's links
            [
                'unique_id' => 'jo2wx6d',
                'link_target' => 'https://tailwindcss.com',
                'passed' => 21,
                'is_active' => true,
                'valid_until' => null,
                'created_by' => $john->id,
            ],
            [
                'unique_id' => 'vt5yz7e',
                'link_target' => 'https://vuejs.org',
                'passed' => 58,
                'is_active' => true,
                'valid_until' => now()->addDays(7),
                'created_by' => $john->id,
            ],
        ];

        foreach ($links as $link) {
            Link::create($link);
        }
    }
}
