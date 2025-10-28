import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const publicDir = path.join(process.cwd(), 'public/dev');
    
    const requiredFiles = [
      'face.png',
      'helmet.png', 
      'face-depth-map.png',
      'helmet-depth-map.png'
    ];

    interface FileStatus {
      exists: boolean;
      size?: number;
      modified?: string;
      error?: string;
    }

    const fileStatus: Record<string, FileStatus> = {};

    for (const file of requiredFiles) {
      const filePath = path.join(publicDir, file);
      try {
        const stats = await fs.stat(filePath);
        fileStatus[file] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      } catch (error) {
        fileStatus[file] = {
          exists: false,
          error: 'File not found'
        };
      }
    }

    return NextResponse.json({
      directory: publicDir,
      files: fileStatus,
      allPresent: Object.values(fileStatus).every((status: any) => status.exists)
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check assets', details: error.message },
      { status: 500 }
    );
  }
}