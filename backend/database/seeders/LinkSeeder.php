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
            [
                'unique_id' => 'gh3xm1a',
                'link_target' => 'https://github.com',
                'passed' => 142,
                'datetime_created' => now()->subDays(10),
                'created_by' => $admin->id,
                'is_active' => true,
            ],
            [
                'unique_id' => 'yt7kz2b',
                'link_target' => 'https://youtube.com',
                'passed' => 89,
                'datetime_created' => now()->subDays(8),
                'created_by' => $admin->id,
                'is_active' => true,
            ],
            [
                'unique_id' => 'lv9np3c',
                'link_target' => 'https://laravel.com/docs',
                'passed' => 33,
                'datetime_created' => now()->subDays(5),
                'created_by' => $admin->id,
                'is_active' => true,
            ],
            [
                'unique_id' => 'del4qr5',
                'link_target' => 'https://example.com/deleted-page',
                'passed' => 7,
                'datetime_created' => now()->subDays(15),
                'created_by' => $admin->id,
                'datetime_deleted' => now()->subDays(2),
                'deleted_by' => $admin->id,
                'is_active' => false,
            ],
            [
                'unique_id' => 'jo2wx6d',
                'link_target' => 'https://tailwindcss.com',
                'passed' => 21,
                'datetime_created' => now()->subDays(3),
                'created_by' => $john->id,
                'is_active' => true,
            ],
            [
                'unique_id' => 'vt5yz7e',
                'link_target' => 'https://vuejs.org',
                'passed' => 58,
                'datetime_created' => now()->subDays(6),
                'created_by' => $john->id,
                'is_active' => true,
            ],
        ];

        foreach ($links as $link) {
            Link::create($link);
        }
    }
}
