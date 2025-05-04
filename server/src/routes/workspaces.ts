import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const workspaceRoutes = Router();

workspaceRoutes.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name) {
    res.status(400).json({ message: "Workspace name is required." });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const newWorkspace = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: name,
          ownerId: userId,
        },
      });
      await tx.workspaceMember.create({
        data: {
          userId: userId,
          workspaceId: workspace.id,
          role: "owner",
        },
      });
      return workspace;
    });
    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Failed to create workspace." });
  }
});

workspaceRoutes.get("/", async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: userId },
      include: {
        workspace: true,
      },
      orderBy: {
        workspace: {
          createdAt: "desc",
        },
      },
    });

    const workspaces = memberships.map((membership) => membership.workspace);
    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces." });
  }
});

workspaceRoutes.get("/:workspaceId", async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { workspaceId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  if (!workspaceId) {
    res.status(401).json({ message: "Workspace ID parameter is required." });
    return;
  }

  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        message: "Access denied: You are not a member of this workspace.",
      });
      return;
    }

    const workspaceDetails = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: { id: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!workspaceDetails) {
      res.status(404).json({ message: "Workspace not found." });
      return;
    }

    res.status(200).json(workspaceDetails);
  } catch (error) {
    console.error(
      `Error fetching workspace details for ${workspaceId}:`,
      error
    );
    if (
      error instanceof Error &&
      error.message.includes("Invalid invocation")
    ) {
      res.status(400).json({ message: "Invalid Workspace ID format." });
      return;
    }
    res.status(500).json({ message: "Failed to fetch workspace details." });
  }
});

export default workspaceRoutes;
