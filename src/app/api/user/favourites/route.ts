import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/user";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          message: "You must be logged in to add favorites",
        },
        { status: 401 }
      );
    }
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({
        message: "User doesnt exist",
      });
    }

    // Extract trackId from request body
    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        {
          message: "Track ID is required",
        },
        { status: 400 }
      );
    }

    // Check if track is already in favorites
    const existingFavorite = await db.favourite.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: trackId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        {
          message: "Track is already in your favorites",
        },
        { status: 409 }
      );
    }

    // Insert new favorite into database
    const newFavorite = await db.favourite.create({
      data: {
        userId: user.id,
        trackId: trackId,
      },
    });

    return NextResponse.json(
      {
        message: "Track added to favorites successfully!",
        favorite: newFavorite,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      {
        message: "Failed to add track to favorites. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          message: "You must be logged in to add favorites",
        },
        { status: 401 }
      );
    }
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({
        message: "User doesnt exist",
      });
    }

    const favourites = await db.favourite.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    

    return NextResponse.json(
      {
        favourites: favourites,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch favorites",
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          message: "You must be logged in to add favorites",
        },
        { status: 401 }
      );
    }
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({
        message: "User doesnt exist",
      });
    }

    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        {
          message: "Track ID is required",
        },
        { status: 400 }
      );
    }

    const deletedFavorite = await db.favourite.delete({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: trackId,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Track removed from favorites successfully!",
        deletedFavorite,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      {
        message: "Failed to remove track from favorites",
      },
      { status: 500 }
    );
  }
}
